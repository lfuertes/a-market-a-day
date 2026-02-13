import { Button } from "../atoms/Button";
import { translations } from "../../lib/translations";

interface RecipeModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  lang: "en" | "es";
}

export const RecipeModal = ({
  isOpen,
  title,
  description,
  onClose,
  lang,
}: RecipeModalProps) => {
  const t = translations[lang];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="overlay fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] z-[100]"
        onClick={onClose}
      />
      <div
        className="recipe-card fixed bottom-0 left-1/2 w-full max-w-[500px] bg-white p-[30px] pb-[calc(30px+env(safe-area-inset-bottom))] rounded-t-[25px] z-[101] shadow-[0_-10px_30px_rgba(0,0,0,0.2)] animate-[slideUp_0.3s_ease-out] max-h-[90dvh] overflow-y-auto flex flex-col"
        style={{ transform: "translateX(-50%)" }}
      >
        <h2 className="text-[1.5rem] mt-0 font-playfair">{title}</h2>
        <div className="flex-1 overflow-y-auto mb-5">
          <p className="text-[#444] leading-[1.6] m-0">{description}</p>
        </div>
        <Button onClick={onClose} className="w-full">
          {t.close}
        </Button>
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
