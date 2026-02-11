import { useState } from "react";
import { Header } from "../organisms/Header";
import { Hero } from "../organisms/Hero";
import { IngredientsGrid } from "../organisms/IngredientsGrid";
import { RecipeModal } from "../organisms/RecipeModal";
import { FunFact } from "../organisms/FunFact";
import { Footer } from "../organisms/Footer";
import mockData from "../../mock.json";

export const Home = () => {
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

  return (
    <>
      <Header location={mockData.location} date={mockData.date} />
      <Hero imageSrc={mockData.heroImage} />
      <IngredientsGrid
        ingredients={mockData.ingredients}
        onIngredientClick={handleOpenRecipe}
      />
      <FunFact text={mockData.funFact} />
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
