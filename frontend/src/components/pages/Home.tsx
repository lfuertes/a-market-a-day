import { useState, useEffect } from "react";
import { Header } from "../organisms/Header";
import { Hero } from "../organisms/Hero";
import { IngredientsGrid } from "../organisms/IngredientsGrid";
import { RecipeModal } from "../organisms/RecipeModal";
import { FunFact } from "../organisms/FunFact";
import { Footer } from "../organisms/Footer";
import { useMarketData, getLocalizedText } from "../../hooks/useMarketData";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../lib/firebase";
import { translations } from "../../lib/translations";

interface HomeProps {
  initialData?: any;
  lang: "es" | "en";
}

export const Home = ({ initialData, lang }: HomeProps) => {
  const { marketData, loading, error } = useMarketData(initialData);
  const [selectedRecipe, setSelectedRecipe] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const t = translations[lang];

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "page_view");
    }
  }, []);

  const handleOpenRecipe = (title: string, description: string) => {
    setSelectedRecipe({ title, description });
  };

  const handleCloseRecipe = () => {
    setSelectedRecipe(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen font-playfair animate-pulse text-[#aaa]">
        {t.loading}
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className="flex items-center justify-center h-screen font-playfair text-[#aaa] text-center px-10 whitespace-pre-line">
        {t.error}
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString(
    lang === "en" ? "en-US" : "es-ES",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  const location = getLocalizedText(marketData.location, lang);
  const funFact = getLocalizedText(marketData.funFact, lang);
  const ingredients = marketData.ingredients.map((ing) => ({
    ...ing,
    title: getLocalizedText(ing.title, lang),
    description: getLocalizedText(ing.description, lang),
  }));

  return (
    <>
      <Header location={location} date={todayStr} />
      <Hero imageSrc={marketData.heroImage} />
      <IngredientsGrid
        ingredients={ingredients}
        onIngredientClick={handleOpenRecipe}
        lang={lang}
      />
      <FunFact text={funFact} lang={lang} />
      <Footer lang={lang} />
      <RecipeModal
        isOpen={!!selectedRecipe}
        title={selectedRecipe?.title || ""}
        description={selectedRecipe?.description || ""}
        onClose={handleCloseRecipe}
        lang={lang}
      />
    </>
  );
};
