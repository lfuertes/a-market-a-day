import { Image } from "../atoms/Image";

interface IngredientCardProps {
  title: string;
  imageSrc: string;
  description: string;
  onClick: (title: string, description: string) => void;
}

export const IngredientCard = ({
  title,
  imageSrc,
  description,
  onClick,
}: IngredientCardProps) => {
  return (
    <div
      className="item flex flex-col items-center cursor-pointer"
      onClick={() => onClick(title, description)}
    >
      <Image
        src={imageSrc}
        alt={title}
        aspectRatio="1/1"
        className="rounded-[50%] mb-2 border border-[#eee]"
      />
      <p className="text-[0.6rem] font-bold m-0 uppercase">{title}</p>
    </div>
  );
};
