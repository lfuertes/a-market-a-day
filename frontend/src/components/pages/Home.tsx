import { useState } from "react";
import { Header } from "../organisms/Header";
import { Hero } from "../organisms/Hero";
import { IngredientsGrid } from "../organisms/IngredientsGrid";
import { RecipeModal } from "../organisms/RecipeModal";
import { FunFact } from "../organisms/FunFact";

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
      <Header />
      <Hero />
      <IngredientsGrid onIngredientClick={handleOpenRecipe} />
      <FunFact />
      <RecipeModal
        isOpen={!!selectedRecipe}
        title={selectedRecipe?.title || ""}
        description={selectedRecipe?.description || ""}
        onClose={handleCloseRecipe}
      />
    </>
  );
};
