"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { AutoPart } from "@/data/mockData";
import { formatLKR } from "@/lib/utils";

interface ImageModalProps {
  part: AutoPart | null;
  onClose: () => void;
}

export default function ImageModal({ part, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (part) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [part, onClose]);

  if (!part) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Bottom sheet on mobile, centered card on desktop */}
      <div
        className="relative w-full sm:max-w-sm bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "92vh" }}
      >
        {/* Image Area */}
        <div className="relative w-full h-56 sm:h-64 bg-[#F4F6FA] overflow-hidden shrink-0">
          <Image
            src={part.imageUrl}
            alt={part.name}
            fill
            sizes="(max-width: 640px) 100vw, 384px"
            className="object-cover"
            priority
          />
          {/* Close button overlay */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-xs rounded-xl flex items-center justify-center shadow-sm text-gray-600 hover:bg-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Category chip overlaid on image */}
          <div className="absolute bottom-3 left-3">
            <span className="text-xs font-bold bg-white/90 backdrop-blur-xs text-[#4361EE] px-2.5 py-1 rounded-full shadow-sm">
              {part.categoryName}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Part Number */}
          <p className="text-[11px] font-semibold font-mono text-gray-400 tracking-wide mb-1">
            {part.partNumber}
          </p>

          {/* Part Name */}
          <h3 className="text-lg font-black text-gray-900 leading-tight tracking-tight mb-2">
            {part.name}
          </h3>

          {/* Description */}
          {part.description && (
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {part.description}
            </p>
          )}

          {/* Price + Stock Row */}
          <div className="flex items-center justify-between bg-[#F4F6FA] rounded-2xl p-4 mb-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                Price
              </p>
              <p className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                {formatLKR(part.price)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                part.isAvailable
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {part.isAvailable ? (
                <><CheckCircle2 className="w-3.5 h-3.5" />In Stock</>
              ) : (
                <><AlertCircle className="w-3.5 h-3.5" />Out of Stock</>
              )}
            </span>
          </div>

          {/* Done button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-[#4361EE] hover:bg-[#3451D1] text-white font-bold text-sm shadow-md shadow-[#4361EE]/25 transition-all cursor-pointer min-h-[48px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
