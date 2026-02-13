interface FooterProps {
  lang: "es" | "en";
}

export const Footer = ({ lang }: FooterProps) => {
  const text =
    lang === "en"
      ? "Discover a new market \n every day"
      : "Descubre un nuevo mercado \n cada día";

  return (
    <div className="w-full max-w-[500px] text-center px-10 mt-10 mb-20">
      <p className="text-[0.7rem] text-[#aaa] uppercase tracking-[2px] leading-relaxed whitespace-pre-line">
        {text}
      </p>
    </div>
  );
};
