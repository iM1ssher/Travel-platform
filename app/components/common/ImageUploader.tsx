"use client";

import { CldUploadWidget } from "next-cloudinary";
import type { MouseEvent } from "react";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  buttonText?: string;
}

export default function ImageUploader({
  onUploadSuccess,
  buttonText = "上傳圖片",
}: ImageUploaderProps) {
  return (
    <CldUploadWidget
      uploadPreset="travel-platform-preset"
      onSuccess={(result) => {
        if (result.info && typeof result.info === "object" && "secure_url" in result.info) {
          const imageUrl = result.info.secure_url as string;
          onUploadSuccess(imageUrl);
        }
      }}
    >
      {({ open }) => {
        function handleOnClick(event: MouseEvent<HTMLButtonElement>) {
          event.preventDefault();
          open();
        }

        return (
          <button
            type="button"
            onClick={handleOnClick}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            {buttonText}
          </button>
        );
      }}
    </CldUploadWidget>
  );
}
