import { Image } from "../atoms/Image";

export const Hero = () => {
  return (
    <div className="hero w-full p-5 max-w-[500px]">
      <div className="img-container w-full aspect-[4/5] bg-[#eee] rounded-[12px] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.1)]">
        <Image
          src="https://www.caminosdepasion.com/wp-content/uploads/Mercado-2Bde-2BAbastos-2B02A.jpeg"
          alt="Mercado"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
