import { Button } from "../atoms/Button";

interface RecipeModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export const RecipeModal = ({
  isOpen,
  title,
  description,
  onClose,
}: RecipeModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="overlay fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] z-[100]"
        onClick={onClose}
      />
      <div
        className="recipe-card fixed bottom-0 w-full max-w-[500px] bg-white p-[30px] rounded-t-[25px] z-[101] shadow-[0_-10px_30px_rgba(0,0,0,0.2)] animate-[slideUp_0.3s_ease-out]"
        style={{ left: "50%", transform: "translateX(-50%)" }}
      >
        <h2 className="text-[1.5rem] mt-0 font-playfair">{title}</h2>
        <p className="text-[#444] leading-[1.6]">{description}</p>
        <Button onClick={onClose}>CERRAR</Button>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); }
          to { transform: translate(-50%, 0); }
        }
      `}</style>
    </>
  );
};
