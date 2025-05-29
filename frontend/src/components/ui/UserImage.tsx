"use client";

import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

interface UserImageProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export default function UserImage({
  src,
  alt,
  size = "sm",
  className = "",
}: UserImageProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = sizeClasses[size];

  if (!src || imageError) {
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        <UserCircleIcon className={`h-full w-full text-neutral-400`} />
      </div>
    );
  }

  const isBase64 = src.startsWith("data:image");

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover rounded-full"
        onError={() => setImageError(true)}
        unoptimized={isBase64}
      />
    </div>
  );
}
