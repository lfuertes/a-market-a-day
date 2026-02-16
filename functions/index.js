const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const {VertexAI} = require("@google-cloud/vertexai");
const admin = require("firebase-admin");
const {PredictionServiceClient} = require("@google-cloud/aiplatform");
const {helpers} = require("@google-cloud/aiplatform");
const sharp = require("sharp");

admin.initializeApp();
const db = admin.firestore();

const project = "market-a-day";
const location = "us-central1";

const vertexAI = new VertexAI({
  project: project,
  location: location,
});

const generativeModel = vertexAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const predictionServiceClient = new PredictionServiceClient({
  apiEndpoint: `${location}-aiplatform.googleapis.com`,
});

/**
 * Generates an image using Google Imagen 3
 * @param {string} prompt Visual description in English.
 * @param {string} destPath Firebase Storage path.
 * @param {number} [retryCount=0] Current retry attempt.
 * @param {boolean} [generateSocial=false] Whether to generate a thumbnail.
 * @return {Promise<string>} Public URL.
 */
async function generateHighQualityImage(prompt, destPath, retryCount = 0,
    generateSocial = false) {
  try {
    logger.info(`Generating Imagen 3 image for: ${destPath}`);

    const endpoint = `projects/${project}/locations/${location}/` +
                     `publishers/google/models/imagen-3.0-generate-001`;

    const instance = {
      prompt: prompt,
    };
    const instances = [helpers.toValue(instance)];

    const parameter = {
      sampleCount: 1,
      aspectRatio: "1:1",
      addWatermark: false,
    };
    const parameters = helpers.toValue(parameter);

    const [response] = await predictionServiceClient.predict({
      endpoint,
      instances,
      parameters,
    });

    const prediction = response.predictions[0];
    const imageData = prediction.structValue.fields.bytesBase64Encoded;
    const imageBytes = imageData.stringValue;
    const buffer = Buffer.from(imageBytes, "base64");

    const bucket = admin.storage().bucket("market-a-day.firebasestorage.app");
    const file = bucket.file(destPath);

    await file.save(buffer, {
      metadata: {contentType: "image/jpeg"},
    });

    await file.makePublic();

    if (generateSocial) {
      try {
        const socialBuffer = await sharp(buffer)
            .resize({width: 600})
            .jpeg({quality: 80})
            .toBuffer();
        const socialDest = destPath.replace(".jpg", "_social.jpg");
        const socialFile = bucket.file(socialDest);
        await socialFile.save(socialBuffer, {
          metadata: {contentType: "image/jpeg"},
        });
        await socialFile.makePublic();
        logger.info(`Social thumbnail generated: ${socialDest}`);
      } catch (err) {
        logger.error("Failed to generate social thumbnail", err);
      }
    }

    return `https://storage.googleapis.com/${bucket.name}/${destPath}`;
  } catch (error) {
    // Retry on Quota Exceeded (Resource Exhausted - code 8)
    if (error.code === 8 && retryCount < 2) {
      const delay = (retryCount + 1) * 10000; // 10s, 20s
      logger.warn(`Quota exceeded for ${destPath}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return generateHighQualityImage(prompt, destPath, retryCount + 1,
          generateSocial);
    }
    logger.error(`Failed to generate Imagen 3 image for ${destPath}`, error);
    return "";
  }
}

exports.helloWorld = onRequest({
  memory: "512MiB",
}, (request, response) => {
  response.send("Service active.");
});

/**
 * Core logic to generate market content for a specific date.
 * If dateStr is not provided, defaults to tomorrow.
 * @param {string} [dateOverride] Format YYYY-MM-DD
 */
async function generateMarketContent(dateOverride) {
  let dateStr = dateOverride;
  if (!dateStr) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateStr = tomorrow.toISOString().split("T")[0];
  }

  logger.info(`Generating market content for date: ${dateStr}`);

  try {
    let lastContinent = "None";

    try {
      const lastMarketSnap = await db.collection("dailyMarkets")
          .limit(1)
          .get();

      if (!lastMarketSnap.empty) {
        lastContinent = lastMarketSnap.docs[0].data().continent || "Unknown";
      }
    } catch (e) {
      logger.warn("Could not fetch last continent", e);
    }

    const pastCountriesSnap = await db.collection("generatedCountries").get();
    const pastCountries = pastCountriesSnap.docs.map((d) => d.id).join(", ");

    const prompt = `
      Generate a panoramic market entry for date ${dateStr}.
      LOGIC REQUIREMENTS:
      - Country MUST NOT be in this list: ${pastCountries}.
      - Continent MUST BE DIFFERENT from: ${lastContinent}.
      ART DIRECTION (heroImageDescription):
      Describe a stunning wide shot of a traditional market in {City, Country}.
      Capture city's soul (e.g., Amsterdam canals, Marrakech souks).
      National Geographic style, cinematic lighting, 8k, detailed.
      PRODUCT ART DIRECTION (imageDescription):
      Professional macro photography of a {product} found in this market,
      soft bokeh, 8k.
      RETURN ONLY JSON with this bilingual structure:
      {
        "location": { "en": "City, Country", "es": "Ciudad, País" },
        "continent": { "en": "Continent Name", "es": "Nombre Continente" },
        "heroImageDescription": "English prompt for hero image",
        "products": [
          {
            "title": { "en": "Name", "es": "Nombre" },
            "imageDescription": "English prompt for product",
            "description": {
              "en": "English description",
              "es": "Descripción en español",
            }
          }
        ],
        "funFact": { "en": "English fun fact", "es": "Curiosidad en español" }
      }
      IMPORTANT: Generate exactly 3 products. They can be food, crafts, seeds,
      or anything typical of that market.`;

    const result = await generativeModel.generateContent(prompt);
    const res = await result.response;
    let text = res.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const market = JSON.parse(text);
    logger.info(`Selected: ${market.location} in ${market.continent}. ` +
                "Starting image generation...");

    const hDest = `markets/${dateStr}/hero.jpg`;
    market.heroImage = await generateHighQualityImage(
        market.heroImageDescription, hDest, 0, true);

    if (!market.heroImage) {
      throw new Error(`Hero image generation failed for ${dateStr}`);
    }

    // Procesamos productos con un pequeño retraso para evitar Quota Exceeded
    for (let i = 0; i < (market.products || []).length; i++) {
      const prod = market.products[i];
      const iDest = `markets/${dateStr}/prod_${i}.jpg`;

      // Esperar 5 segundos entre peticiones de imagen para mayor seguridad
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const url = await generateHighQualityImage(prod.imageDescription, iDest);
      if (!url) {
        throw new Error(`Failed to generate image for product: ${prod.title}`);
      }
      prod.imageSrc = url;
      delete prod.imageDescription;
    }

    delete market.heroImageDescription;
    // Map products back to ingredients for frontend compatibility if needed,
    // but better to update the frontend. For now, let's keep both or rename.
    market.ingredients = market.products;

    await db.collection("dailyMarkets").doc(dateStr).set(market);

    const cParts = market.location.en.split(",");
    const country = cParts.length > 1 ? cParts[1].trim() : market.location.en;
    await db.collection("generatedCountries").doc(country).set({
      lastGenerated: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Market for ${dateStr} successfully saved with ` +
                `${market.ingredients.length} ingredients.`);
    return `Market generated for ${dateStr}`;
  } catch (error) {
    logger.error("Daily generation error:", error);
    throw error;
  }
}

exports.generateDailyMarket = onSchedule({
  schedule: "0 5 * * *",
  timeoutSeconds: 540,
  memory: "512MiB",
}, async (event) => {
  logger.info("Starting scheduled daily generation...");
  await generateMarketContent();
});

const {defineSecret} = require("firebase-functions/params");
const apiKey = defineSecret("ADMIN_API_KEY");

exports.manualGenerateDailyMarket = onRequest({
  memory: "512MiB",
  timeoutSeconds: 540,
  secrets: [apiKey],
}, async (req, res) => {
  // Security check
  const providedKey = (req.query.key || "").trim();
  const expectedKey = (apiKey.value() || "").trim();

  if (providedKey !== expectedKey) {
    logger.warn("Unauthorized manual generation attempt.");
    res.status(403).send({success: false, error: "Unauthorized: Invalid key"});
    return;
  }

  const date = req.query.date; // Optional: ?date=YYYY-MM-DD
  logger.info(`Manual generation triggered for date: ${date || "tomorrow"}`);
  try {
    const result = await generateMarketContent(date);
    res.send({success: true, message: result});
  } catch (error) {
    res.status(500).send({success: false, error: error.message});
  }
});

// Astro SSR handler
exports.ssr = onRequest({
  memory: "512MiB",
}, (request, response) => {
  const {handler: astroHandler} = require("./server/entry.mjs");
  astroHandler(request, response);
});

