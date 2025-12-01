"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends React.ComponentProps<typeof Image> {
  fallback?: string;
  errorFallback?: string;
  className?: string;
  containerClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallback = "/images/placeholder.svg",
  errorFallback = "/images/placeholder-error.svg",
  className,
  containerClassName,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>(src as string);
  const [error, setError] = useState<boolean>(false);

  const handleError = () => {
    if (!error) {
      setImgSrc(errorFallback);
      setError(true);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      <Image
        {...props}
        src={imgSrc || fallback}
        alt={alt}
        className={cn("object-cover", className)}
        onError={handleError}
      />
    </div>
  );
} 