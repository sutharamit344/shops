"use client";

import React, { useState } from "react";
import NextImage from "next/image";
import { Image as ImageIcon } from "lucide-react";

const SafeImage = ({
  src,
  alt = "Image",
  fallbackIcon: FallbackIcon = ImageIcon,
  iconSize = 24,
  className = "",
  showLabel = false,
  fill = false,
  unoptimized = true,
  ...props
}) => {
  const [prevSrc, setPrevSrc] = useState(src);
  const [error, setError] = useState(false);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setError(false);
  }

  let cleanSrc = null;
  if (typeof src === "string") {
    const trimmed = src.trim();
    cleanSrc = trimmed ? (trimmed.includes(" ") ? trimmed.replace(/\s/g, "%20") : trimmed) : null;
  } else if (src && typeof src === "object") {
    cleanSrc = src; // Next.js static import object
  }

  if (!cleanSrc || error) {
    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border border-black/[0.04] dark:border-white/[0.04] select-none rounded-inherit ${className}`}
      >
        <FallbackIcon size={iconSize} className="text-zinc-300 dark:text-zinc-700 shrink-0" />
        {showLabel && (
          <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1.5 px-2 text-center truncate w-full">
            No image available
          </span>
        )}
      </div>
    );
  }

  return (
    <NextImage
      src={cleanSrc}
      alt={alt}
      fill={fill}
      unoptimized={unoptimized}
      onError={() => setError(true)}
      className={className}
      {...props}
    />
  );
};

export default SafeImage;
