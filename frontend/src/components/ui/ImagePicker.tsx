"use client";

import { ChangeEvent, useRef, useState, useEffect } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";
import UserImage from "./UserImage";

interface ImagePickerProps {
  value?: string | null;
  onChange: (base64: string | null) => void;
  label?: string;
  description?: string;
  className?: string;
}

const ACCEPTED_FILE_TYPES = {
  "image/jpeg": true,
  "image/png": true,
  "image/gif": true,
  "image/webp": true,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImagePicker({
  value,
  onChange,
  label = "Profile Picture",
  description = "Upload a profile picture (max 5MB)",
  className = "",
}: ImagePickerProps) {
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value changes
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");

    if (!file) {
      onChange(null);
      setPreview(null);
      return;
    }

    if (!ACCEPTED_FILE_TYPES[file.type as keyof typeof ACCEPTED_FILE_TYPES]) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be less than 5MB");
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      onChange(base64);
      setPreview(base64);
    } catch (err) {
      setError("Failed to process image");
      console.error(err);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="flex items-center space-x-4">
        <UserImage
          src={preview}
          alt="Profile preview"
          size="lg"
          className="flex-shrink-0"
        />

        <div className="flex-grow">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PhotoIcon className="h-5 w-5" />
            <span>Choose Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
