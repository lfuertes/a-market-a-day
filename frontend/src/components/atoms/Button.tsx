import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, className = "", ...props }: ButtonProps) => {
  return (
    <button
      className={`bg-[#1a1a1a] text-white border-none p-[15px] rounded-[12px] font-bold w-full mt-5 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
