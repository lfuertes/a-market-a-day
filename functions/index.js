const {onRequest} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const {VertexAI} = require("@google-cloud/vertexai");
const admin = require("firebase-admin");
const {PredictionServiceClient} = require("@google-cloud/aiplatform");
const {helpers} = require("@google-cloud/aiplatform");

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
 * @return {Promise<string>} Public URL.
 */
async function generateHighQualityImage(prompt, destPath, retryCount = 0) {
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
    return `https://storage.googleapis.com/${bucket.name}/${destPath}`;
  } catch (error) {
    // Retry on Quota Exceeded (Resource Exhausted - code 8)
    if (error.code === 8 && retryCount < 2) {
      const delay = (retryCount + 1) * 10000; // 10s, 20s
      logger.warn(`Quota exceeded for ${destPath}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return generateHighQualityImage(prompt, destPath, retryCount + 1);
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

exports.generateDailyMarket = onSchedule({
  schedule: "0 5 * * *",
  timeoutSeconds: 540,
  memory: "512MiB",
}, async (event) => {
  logger.info("Starting refined daily generation...");

  try {
    let lastContinent = "None";

    try {
      // Simplificamos la consulta para evitar necesidad de índice compuesto
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

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];

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
      RETURN ONLY JSON:
      {
        "location": "City, Country",
        "continent": "Continent Name",
        "heroImageDescription": "English prompt for hero image",
        "products": [
          {
            "title": "Name",
            "imageDescription": "English prompt for product",
            "description": "Spanish description"
          }
        ],
        "funFact": "Spanish fun fact"
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
        market.heroImageDescription, hDest);

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

    const cParts = market.location.split(",");
    const country = cParts.length > 1 ? cParts[1].trim() : market.location;
    await db.collection("generatedCountries").doc(country).set({
      lastGenerated: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info(`Market for ${dateStr} successfully saved with ` +
                `${market.ingredients.length} ingredients.`);
  } catch (error) {
    logger.error("Daily generation error:", error);
  }
});

// Astro SSR handler
exports.ssr = onRequest({
  memory: "512MiB",
}, (request, response) => {
  const {handler: astroHandler} = require("./server/entry.mjs");
  astroHandler(request, response);
});

