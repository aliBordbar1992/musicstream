"use client";

import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useState, memo, useMemo } from "react";
import { API_URL } from "@/lib/api";

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

const UserImage = memo(function UserImage({
  src,
  alt,
  size = "sm",
  className = "",
}: UserImageProps) {
  const [imageError, setImageError] = useState(false);
  const sizeClass = sizeClasses[size];

  const imageUrl = useMemo(() => {
    if (!src || imageError) return null;
    const isBase64 = src.startsWith("data:image");
    return isBase64 ? src : API_URL + "/" + src.replaceAll("\\", "/");
  }, [src, imageError]);

  if (!src || imageError) {
    return (
      <div className={`relative ${sizeClass} ${className}`}>
        <UserCircleIcon className={`h-full w-full text-neutral-400`} />
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      <Image
        src={imageUrl!}
        alt={alt}
        fill
        sizes={`(max-width: 768px) ${
          size === "sm" ? "32px" : size === "md" ? "48px" : "64px"
        }, ${size === "sm" ? "32px" : size === "md" ? "48px" : "64px"}`}
        className="object-cover rounded-full"
        onError={() => setImageError(true)}
        unoptimized={src.startsWith("data:image")}
        priority
      />
    </div>
  );
});

export default UserImage;
