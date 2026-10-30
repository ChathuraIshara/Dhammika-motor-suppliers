"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  X,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Settings,
  CarFront,
} from "lucide-react";
import { useInventory } from "@/context/InventoryContext";
import { AutoPart } from "@/data/mockData";
import { formatLKR, cn } from "@/lib/utils";
import ImageModal from "@/components/ImageModal";

export default function CustomerCatalogPage() {
  const { categories, parts, isLoaded } = useInventory();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [activeModalPart, setActiveModalPart] = useState<AutoPart | null>(null);

  const groupedCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const targetCategories =
      selectedCategoryId === "all"
        ? categories
        : categories.filter((c) => c.id === selectedCategoryId);

    return targetCategories
      .map((cat) => {
        const catParts = parts.filter((part) => {
          if (part.categoryId !== cat.id) return false;
          if (!query) return true;
          return (
            part.name.toLowerCase().includes(query) ||
            part.partNumber.toLowerCase().includes(query)
          );
        });
        return { category: cat, parts: catParts };
      })
      .filter((group) => (query ? group.parts.length > 0 : true));
  }, [categories, parts, searchQuery, selectedCategoryId]);

  const totalMatchingParts = useMemo(
    () => groupedCategories.reduce((acc, g) => acc + g.parts.length, 0),
    [groupedCategories]
  );

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategoryId("all");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F6FA]">

      {/* ===== STICKY HEADER ===== */}
      <header className="sticky top-0 z-30 bg-[#F4F6FA] pt-4 pb-2">
        <div className="max-w-2xl mx-auto px-4">

          {/* Top Row: Brand + Settings Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4361EE] via-[#3B50C8] to-[#273A9B] shadow-lg shadow-[#4361EE]/30 flex items-center justify-center text-white overflow-hidden"
                aria-hidden="true"
              >
                <div className="absolute -right-3 -top-3 w-8 h-8 rounded-full bg-white/15" />
                <div className="absolute -left-3 -bottom-3 w-8 h-8 rounded-full bg-white/10" />
                <CarFront className="w-6 h-6" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <h1 className="text-[1.15rem] font-black tracking-tight leading-none whitespace-nowrap">
                  <span className="text-gray-900">Dhammika Motor </span>
                  <span className="bg-gradient-to-r from-[#4361EE] to-[#6D7FF2] bg-clip-text text-transparent">
                    Suppliers
                  </span>
                </h1>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-5 h-0.5 rounded-full bg-[#4361EE]" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Trusted automotive parts
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/admin/login"
              className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-[#4361EE] transition-colors cursor-pointer"
              aria-label="Admin"
              title="Admin Portal"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search part name or number..."
              className="w-full pl-11 pr-10 py-3.5 bg-white text-gray-900 placeholder-gray-400 text-base rounded-2xl border-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE]/30 transition-all min-h-[52px] font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center min-h-[44px] min-w-[44px] justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategoryId("all")}
              type="button"
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 min-h-[38px] cursor-pointer",
                selectedCategoryId === "all"
                  ? "bg-[#4361EE] text-white shadow-md shadow-[#4361EE]/30"
                  : "bg-white text-gray-500 shadow-sm hover:bg-gray-100"
              )}
            >
              All ({parts.length})
            </button>
            {categories.map((cat) => {
              const count = parts.filter((p) => p.categoryId === cat.id).length;
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  type="button"
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shrink-0 min-h-[38px] cursor-pointer",
                    isSelected
                      ? "bg-[#4361EE] text-white shadow-md shadow-[#4361EE]/30"
                      : "bg-white text-gray-500 shadow-sm hover:bg-gray-100"
                  )}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-2xl mx-auto w-full flex-1 px-4 pt-4 pb-28">
        {/* Loading Skeleton */}
        {!isLoaded ? (
          <div className="space-y-6">
            {[1, 2].map((s) => (
              <div key={s} className="space-y-3">
                <div className="h-5 w-32 bg-gray-200 rounded-xl animate-pulse" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-3xl p-4 shadow-sm animate-pulse flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                        <div className="h-5 bg-gray-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : totalMatchingParts === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm mx-auto max-w-sm mt-8">
            <div className="w-14 h-14 bg-[#F4F6FA] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No parts found</h3>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Try a different search term or browse all categories.
            </p>
            <button
              onClick={handleResetFilters}
              type="button"
              className="w-full py-3 rounded-2xl bg-[#4361EE] hover:bg-[#3451D1] text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-[#4361EE]/25"
            >
              Show All Parts
            </button>
          </div>
        ) : (
          /* Grouped Category Sections */
          <div className="space-y-7">
            {groupedCategories.map((group) => {
              if (group.parts.length === 0) return null;
              return (
                <section key={group.category.id}>
                  {/* Category Title Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-gray-900 tracking-tight">
                        {group.category.name}
                      </h2>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#4361EE]/10 text-[#4361EE]">
                        {group.parts.length}
                      </span>
                    </div>
                    {selectedCategoryId === "all" && (
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryId(group.category.id)}
                        className="text-xs font-semibold text-[#4361EE] hover:opacity-70 transition-opacity cursor-pointer min-h-[40px] flex items-center gap-0.5"
                      >
                        See All <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Parts List — card rows */}
                  <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
                    {group.parts.map((part, idx) => (
                      <button
                        key={part.id}
                        type="button"
                        onClick={() => setActiveModalPart(part)}
                        className={cn(
                          "w-full p-4 flex items-center gap-4 text-left cursor-pointer hover:bg-[#F4F6FA] active:bg-gray-100 transition-colors group",
                          idx !== group.parts.length - 1 ? "border-b border-gray-100" : ""
                        )}
                      >
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#F4F6FA] shrink-0">
                          <Image
                            src={part.imageUrl}
                            alt={part.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-gray-400 font-mono tracking-wide mb-0.5">
                            {part.partNumber}
                          </p>
                          <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">
                            {part.name}
                          </p>
                          <p className="text-base font-black text-gray-900 mt-1 tracking-tight">
                            {formatLKR(part.price)}
                          </p>
                        </div>

                        {/* Right: stock badge + chevron */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full",
                              part.isAvailable
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-gray-100 text-gray-400"
                            )}
                          >
                            {part.isAvailable ? (
                              <><CheckCircle2 className="w-2.5 h-2.5" />In Stock</>
                            ) : (
                              <><AlertCircle className="w-2.5 h-2.5" />Out of Stock</>
                            )}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#4361EE] transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Image Detail Modal */}
      <ImageModal part={activeModalPart} onClose={() => setActiveModalPart(null)} />
    </div>
  );
}
