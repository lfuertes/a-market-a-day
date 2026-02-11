import { IngredientCard } from "../molecules/IngredientCard";

interface IngredientsGridProps {
  onIngredientClick: (title: string, description: string) => void;
}

const ingredients = [
  {
    title: "Especias",
    imageSrc:
      "https://cdn.nutritionstudies.org/wp-content/uploads/2018/01/top-15-spices-plant-based-cooking.jpg",
    description:
      "Mezcla de Ras el Hanout: perfecta para dar el sabor auténtico al Tajín.",
  },
  {
    title: "Menta",
    imageSrc:
      "https://www.infocampo.com.ar/wp-content/uploads/2018/07/menta.jpeg",
    description: "Menta fresca recogida esta mañana para el té tradicional.",
  },
  {
    title: "Dátiles",
    imageSrc:
      "https://hips.hearstapps.com/hmg-prod/images/datiles-elle-gourmet-6576c1f6d0cc1.jpg",
    description: "Dátiles Medjool dulces y carnosos del valle del Draa.",
  },
];

export const IngredientsGrid = ({
  onIngredientClick,
}: IngredientsGridProps) => {
  return (
    <>
      <div className="section-label w-[90%] max-w-[500px] text-[0.75rem] font-bold m-[20px_0_15px_0] text-[#999] tracking-[1px]">
        PRODUCTOS DESTACADOS
      </div>
      <div className="ingredients-grid grid grid-cols-3 gap-[15px] w-[90%] max-w-[500px] mb-[40px]">
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
