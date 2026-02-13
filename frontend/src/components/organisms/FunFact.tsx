import { translations } from "../../lib/translations";

interface FunFactProps {
  text: string;
  lang: "en" | "es";
}

export const FunFact = ({ text, lang }: FunFactProps) => {
  const t = translations[lang];

  return (
    <div className="fun-fact w-full max-w-[500px] px-5 mb-8 text-center">
      <div className="p-6 bg-[#f9f9f9] rounded-xl border border-[#eee]">
        <h3 className="font-playfair text-xl mb-3 text-[#8d775f]">
          {t.funFactTitle}
        </h3>
        <p className="text-sm text-[#555] leading-relaxed">{text}</p>
      </div>
    </div>
  );
};
