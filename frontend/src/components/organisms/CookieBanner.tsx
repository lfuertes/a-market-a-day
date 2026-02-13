import { useState, useEffect, useRef } from "react";
import { setConsent } from "firebase/analytics";

interface CookieBannerProps {
  lang: "en" | "es";
}

export const CookieBanner = ({ lang }: CookieBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (isVisible && bannerRef.current) {
      const updatePadding = () => {
        if (bannerRef.current) {
          const height = bannerRef.current.offsetHeight;
          document.body.style.paddingBottom = `${height}px`;
          document.body.style.transition = "padding-bottom 0.4s ease-out";
        }
      };

      updatePadding();
      window.addEventListener("resize", updatePadding);
      return () => {
        window.removeEventListener("resize", updatePadding);
        document.body.style.paddingBottom = "0px";
      };
    } else {
      document.body.style.paddingBottom = "0px";
    }
  }, [isVisible]);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setConsent({
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "false");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      ref={bannerRef}
      className="fixed bottom-0 left-0 w-full bg-white border-t border-[#f0f0f0] p-4 md:p-6 z-[200] flex flex-col md:flex-row items-center justify-center gap-4 animate-[slideUp_0.4s_ease-out]"
    >
      <div className="text-center md:text-left max-w-[600px]">
        <h4 className="font-playfair text-lg mb-1">
          {lang === "es" ? "Privacidad y Cookies" : "Privacy & Cookies"}
        </h4>
        <p className="text-[0.75rem] text-[#666] leading-relaxed">
          {lang === "es"
            ? "Utilizamos cookies para entender cómo navegas y mejorar tu experiencia. Son anónimas y nos ayudan a que este mercado crezca."
            : "We use cookies to understand how you browse and improve your experience. They are anonymous and help this market grow."}
        </p>
      </div>
      <div className="flex gap-4 items-center shrink-0">
        <button
          onClick={handleReject}
          className="text-[0.7rem] uppercase tracking-[1px] text-[#666] px-6 py-2 rounded-full border border-[#ddd] hover:bg-[#f9f9f9] transition-colors"
        >
          {lang === "es" ? "RECHAZAR" : "REJECT"}
        </button>
        <button
          onClick={handleAccept}
          className="bg-[#333] text-white text-[0.7rem] uppercase tracking-[1px] px-6 py-2 rounded-full hover:bg-black transition-colors"
        >
          {lang === "es" ? "ACEPTAR TODO" : "ACCEPT ALL"}
        </button>
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
