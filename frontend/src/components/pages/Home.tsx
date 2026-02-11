import { useState } from "react";
import { Header } from "../organisms/Header";
import { Hero } from "../organisms/Hero";
import { IngredientsGrid } from "../organisms/IngredientsGrid";
import { RecipeModal } from "../organisms/RecipeModal";
import { FunFact } from "../organisms/FunFact";
import { Footer } from "../organisms/Footer";
import { useMarketData } from "../../hooks/useMarketData";

export const Home = () => {
  const { marketData, loading, error } = useMarketData();
  const [selectedRecipe, setSelectedRecipe] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const handleOpenRecipe = (title: string, description: string) => {
    setSelectedRecipe({ title, description });
  };

  const handleCloseRecipe = () => {
    setSelectedRecipe(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen font-playfair animate-pulse text-[#aaa]">
        Cargando mercado...
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className="flex items-center justify-center h-screen font-playfair text-[#aaa] text-center px-10">
        Lo sentimos, no hemos podido encontrar <br /> el mercado de hoy.
      </div>
    );
  }

  const todayStr = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Header location={marketData.location} date={todayStr} />
      <Hero imageSrc={marketData.heroImage} />
      <IngredientsGrid
        ingredients={marketData.ingredients}
        onIngredientClick={handleOpenRecipe}
      />
      <FunFact text={marketData.funFact} />
      <Footer />
      <RecipeModal
        isOpen={!!selectedRecipe}
        title={selectedRecipe?.title || ""}
        description={selectedRecipe?.description || ""}
        onClose={handleCloseRecipe}
      />
    </>
  );
};
