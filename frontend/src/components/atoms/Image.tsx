import type { ImgHTMLAttributes } from "react";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: string;
  className?: string;
}

export const Image = ({
  aspectRatio = "1/1",
  className = "",
  ...props
}: ImageProps) => {
  return (
    <img
      className={`w-full object-cover block ${className}`}
      style={{ aspectRatio }}
      {...props}
    />
  );
};
