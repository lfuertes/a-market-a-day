import { IngredientCard } from "../molecules/IngredientCard";

interface Ingredient {
  title: string;
  imageSrc: string;
  description: string;
}

interface IngredientsGridProps {
  ingredients: Ingredient[];
  onIngredientClick: (title: string, description: string) => void;
}

export const IngredientsGrid = ({
  ingredients,
  onIngredientClick,
}: IngredientsGridProps) => {
  return (
    <>
      <div className="section-label w-full max-w-[500px] px-5 text-[0.75rem] font-bold m-[20px_0_15px_0] text-[#999] tracking-[1px]">
        PRODUCTOS DESTACADOS
      </div>
      <div className="ingredients-grid grid grid-cols-3 gap-[15px] w-full max-w-[500px] px-5 mb-[40px]">
        {ingredients.map((ing) => (
          <IngredientCard
            key={ing.title}
            title={ing.title}
            imageSrc={ing.imageSrc}
            description={ing.description}
            onClick={onIngredientClick}
          />
        ))}
      </div>
    </>
  );
};
