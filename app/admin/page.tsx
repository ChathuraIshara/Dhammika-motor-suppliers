"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CarFront,
  Plus,
  FolderPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  LogOut,
  X,
} from "lucide-react";
import { useInventory } from "@/context/InventoryContext";
import type { AutoPart } from "@/data/mockData";
import { formatLKR, cn } from "@/lib/utils";
import CategoryPdfExport from "@/components/CategoryPdfExport";

const SAMPLE_IMAGE_PRESETS = [
  {
    name: "Brake Pads",
    url: "https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Engine / Filters",
    url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Suspension",
    url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Alternator / Electric",
    url: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80",
  },
];

export default function AdminDashboardPage() {
  const {
    categories,
    parts,
    addPart,
    updatePart,
    deletePart,
    toggleAvailability,
    addCategory,
    resetToMockData,
  } = useInventory();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");

  // Modals state
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<AutoPart | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [deleteCandidate, setDeleteCandidate] = useState<AutoPart | null>(null);

  // Part Form state
  const [formData, setFormData] = useState({
    name: "",
    partNumber: "",
    categoryId: "",
    price: "",
    imageUrl: "",
    isAvailable: true,
    description: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Quick inline category creator within part modal
  const [isInlineAddingCategory, setIsInlineAddingCategory] = useState(false);
  const [inlineCategoryInput, setInlineCategoryInput] = useState("");

  const handleLogout = () => {
    sessionStorage.removeItem("dhammika_admin_auth");
    sessionStorage.removeItem("dhammika_admin_name");
  };

  // Filtered parts for table
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        part.name.toLowerCase().includes(q) ||
        part.partNumber.toLowerCase().includes(q);

      const matchesCat =
        selectedCategoryId === "all" || part.categoryId === selectedCategoryId;

      return matchesSearch && matchesCat;
    });
  }, [parts, searchQuery, selectedCategoryId]);

  // Metrics
  const metrics = useMemo(() => {
    const inStock = parts.filter((p) => p.isAvailable).length;
    const outOfStock = parts.length - inStock;
    return {
      totalParts: parts.length,
      inStock,
      outOfStock,
      totalCategories: categories.length,
    };
  }, [parts, categories]);

  // Open modal for creating new part
  const handleOpenAddPart = () => {
    setEditingPart(null);
    setFormData({
      name: "",
      partNumber: "",
      categoryId: categories[0]?.id || "",
      price: "",
      imageUrl: SAMPLE_IMAGE_PRESETS[0].url,
      isAvailable: true,
      description: "",
    });
    setFormErrors({});
    setIsInlineAddingCategory(false);
    setIsPartModalOpen(true);
  };

  // Open modal for editing existing part
  const handleOpenEditPart = (part: AutoPart) => {
    setEditingPart(part);
    setFormData({
      name: part.name,
      partNumber: part.partNumber,
      categoryId: part.categoryId,
      price: part.price.toString(),
      imageUrl: part.imageUrl,
      isAvailable: part.isAvailable,
      description: part.description || "",
    });
    setFormErrors({});
    setIsInlineAddingCategory(false);
    setIsPartModalOpen(true);
  };

  // Validate and submit Part Form
  const handleSubmitPart = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Part Name is required";
    if (!formData.partNumber.trim()) errors.partNumber = "Part Number is required";
    if (!formData.categoryId) errors.categoryId = "Category is required";
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = "Enter a valid price greater than 0";
    }
    if (!formData.imageUrl.trim()) errors.imageUrl = "Image URL is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const matchedCat = categories.find((c) => c.id === formData.categoryId);
    const categoryName = matchedCat ? matchedCat.name : "General";

    if (editingPart) {
      updatePart(editingPart.id, {
        name: formData.name.trim(),
        partNumber: formData.partNumber.trim().toUpperCase(),
        categoryId: formData.categoryId,
        categoryName,
        price: Number(formData.price),
        imageUrl: formData.imageUrl.trim(),
        isAvailable: formData.isAvailable,
        description: formData.description.trim(),
      });
    } else {
      addPart({
        name: formData.name.trim(),
        partNumber: formData.partNumber.trim().toUpperCase(),
        categoryId: formData.categoryId,
        categoryName,
        price: Number(formData.price),
        imageUrl: formData.imageUrl.trim(),
        isAvailable: formData.isAvailable,
        description: formData.description.trim(),
      });
    }

    setIsPartModalOpen(false);
  };

  // Handle inline category creation from inside Add/Edit Part Modal
  const handleCreateInlineCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inlineCategoryInput.trim()) return;
    const created = addCategory(inlineCategoryInput.trim());
    setFormData((prev) => ({ ...prev, categoryId: created.id }));
    setInlineCategoryInput("");
    setIsInlineAddingCategory(false);
  };

  // Handle standalone Add Category Modal
  const handleSubmitCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName("");
    setIsCategoryModalOpen(false);
  };

  // Handle Delete Part
  const handleConfirmDelete = () => {
    if (deleteCandidate) {
      deletePart(deleteCandidate.id);
      setDeleteCandidate(null);
    }
  };

  // Reset to default mock data confirmation
  const handleResetData = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all inventory to the initial factory mock data? Any custom parts will be reset."
      )
    ) {
      resetToMockData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* ================= ADMIN TOP NAVIGATION ================= */}
      <header className="bg-[#F4F6FA] border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4361EE] via-[#3B50C8] to-[#273A9B] shadow-lg shadow-[#4361EE]/30 flex items-center justify-center text-white overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute -right-3 -top-3 w-8 h-8 rounded-full bg-white/15" />
              <div className="absolute -left-3 -bottom-3 w-8 h-8 rounded-full bg-white/10" />
              <CarFront className="w-5 h-5" strokeWidth={2.25} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg tracking-tight leading-tight">
                  <span className="text-slate-900">Dhammika Motor </span>
                  <span className="bg-gradient-to-r from-[#4361EE] to-[#6D7FF2] bg-clip-text text-transparent">
                    Suppliers
                  </span>
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                  ADMIN
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-5 h-0.5 rounded-full bg-[#4361EE]" />
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Inventory & Catalog Management
                </p>
              </div>
            </div>
          </div>

          <div className="ml-auto flex flex-1 items-center justify-between gap-2 sm:gap-3">
            {/* Link back to Customer Catalog View */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all border border-slate-200 min-h-[44px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>Customer Catalog View</span>
            </Link>

            {/* Logout */}
            <Link
              href="/admin/login"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors border border-slate-200 min-h-[44px] cursor-pointer"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold">Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Total Parts
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {metrics.totalParts}
            </div>
            <span className="text-[11px] text-slate-400">In catalog database</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">
              In Stock
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">
              {metrics.inStock}
            </div>
            <span className="text-[11px] text-emerald-600/80">Available immediately</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold uppercase text-rose-500 tracking-wider">
              Out of Stock
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
              {metrics.outOfStock}
            </div>
            <span className="text-[11px] text-rose-500/80">Needs replenishment</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold uppercase text-slate-600 tracking-wider">
              Categories
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">
              {metrics.totalCategories}
            </div>
            <span className="text-[11px] text-slate-400">Active categories</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Add Part Button (Clean Blue primary button) */}
              <button
                type="button"
                onClick={handleOpenAddPart}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all min-h-[44px] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Auto Part</span>
              </button>

              {/* Add Category Button */}
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-all min-h-[44px] cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-slate-500" />
                <span>Add Category</span>
              </button>

              {/* Category-Wise PDF Generator */}
              <CategoryPdfExport categories={categories} parts={parts} />
            </div>

            {/* Reset Factory Mock Data */}
            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-medium transition-colors min-h-[44px] cursor-pointer"
              title="Reset inventory to initial mock dataset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Mock Data</span>
            </button>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
            <div className="sm:col-span-8 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by part name or part number (#TY-BRK...)"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 text-slate-900 placeholder-slate-400 text-base rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all min-h-[44px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 min-h-[44px] min-w-[44px] justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-base rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all min-h-[44px]"
              >
                <option value="all">All Categories ({parts.length})</option>
                {categories.map((c) => {
                  const count = parts.filter((p) => p.categoryId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* ================= INVENTORY TABLE / LIST ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                Parts Inventory Table
              </h2>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                {filteredParts.length} items
              </span>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Changes reflect immediately on the customer catalog
            </span>
          </div>

          {filteredParts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No auto parts match your filters</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryId("all");
                }}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline min-h-[44px] px-3 inline-flex items-center"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Desktop View Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">Photo</th>
                      <th className="py-3 px-4">Part Description</th>
                      <th className="py-3 px-4">Part #</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Price (LKR)</th>
                      <th className="py-3 px-4 text-center">Stock Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredParts.map((part) => (
                      <tr
                        key={part.id}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <Image
                              src={part.imageUrl}
                              alt={part.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                          <div className="line-clamp-2 leading-snug">{part.name}</div>
                          {part.description && (
                            <div className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                              {part.description}
                            </div>
                          )}
                        </td>

                        {/* Part Number (Neutral monospace chip) */}
                        <td className="py-3 px-4 font-mono font-medium text-xs text-slate-700 whitespace-nowrap">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">
                            {part.partNumber}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">
                            {part.categoryName}
                          </span>
                        </td>

                        {/* Price: Clean, bold text-slate-900 (NOT blue!) */}
                        <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatLKR(part.price)}
                        </td>

                        {/* Quick stock toggle */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleAvailability(part.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer min-h-[36px]",
                              part.isAvailable
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200"
                            )}
                            title="Click to toggle availability"
                          >
                            {part.isAvailable ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>In Stock</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                <span>Out of Stock</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPart(part)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Edit Part"
                              aria-label="Edit Part"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteCandidate(part)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Delete Part"
                              aria-label="Delete Part"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View Card List */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredParts.map((part) => (
                  <div key={part.id} className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <Image
                          src={part.imageUrl}
                          alt={part.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[120px]">
                            {part.categoryName}
                          </span>
                          <span className="font-mono text-[11px] font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {part.partNumber}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 leading-tight line-clamp-2">
                          {part.name}
                        </h3>
                        {/* Price: neutral slate-900 */}
                        <div className="text-base font-bold text-slate-900 mt-1">
                          {formatLKR(part.price)}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Card Action Bar */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      {/* Stock Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleAvailability(part.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer min-h-[44px]",
                          part.isAvailable
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        )}
                      >
                        {part.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPart(part)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl min-h-[44px] cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(part)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                          aria-label="Delete Part"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ================= ADD / EDIT PART MODAL ================= */}
      {isPartModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 backdrop-blur-xs sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                  {editingPart ? (
                    <Edit2 className="w-5 h-5" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    {editingPart ? "Edit Auto Part" : "Add New Auto Part"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingPart ? `Updating ${editingPart.partNumber}` : "Add an item to the catalog"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPartModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmitPart}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-6 sm:p-6"
            >
              <div className="space-y-4">
              {/* Part Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Part Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Front Ceramic Brake Pads - Hilux KDH"
                  className={cn(
                    "w-full px-3.5 py-2.5 text-base rounded-xl border focus:outline-none focus:ring-2 min-h-[44px]",
                    formErrors.name
                      ? "border-rose-400 focus:ring-rose-500 bg-rose-50/50"
                      : "border-slate-300 focus:ring-blue-600 bg-white"
                  )}
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Part Number & Price in a row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Part Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Part Number / Code *
                  </label>
                  <input
                    type="text"
                    value={formData.partNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, partNumber: e.target.value })
                    }
                    placeholder="e.g. #TY-BRK-4091"
                    className={cn(
                      "w-full px-3.5 py-2.5 font-mono text-base rounded-xl border focus:outline-none focus:ring-2 min-h-[44px]",
                      formErrors.partNumber
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/50"
                        : "border-slate-300 focus:ring-blue-600 bg-white"
                    )}
                  />
                  {formErrors.partNumber && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.partNumber}</p>
                  )}
                </div>

                {/* Price in LKR */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Price (LKR) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 4500"
                    className={cn(
                      "w-full px-3.5 py-2.5 text-base rounded-xl border focus:outline-none focus:ring-2 min-h-[44px]",
                      formErrors.price
                        ? "border-rose-400 focus:ring-rose-500 bg-rose-50/50"
                        : "border-slate-300 focus:ring-blue-600 bg-white"
                    )}
                  />
                  {formErrors.price && (
                    <p className="text-xs text-rose-600 mt-1">{formErrors.price}</p>
                  )}
                </div>
              </div>

              {/* Category Dropdown with quick create */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsInlineAddingCategory(!isInlineAddingCategory)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 min-h-[36px] flex items-center cursor-pointer"
                  >
                    {isInlineAddingCategory ? "Cancel new category" : "+ Quick Add Category"}
                  </button>
                </div>

                {isInlineAddingCategory ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mb-2">
                    <span className="text-xs font-semibold text-slate-700 block">
                      Create & select category:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inlineCategoryInput}
                        onChange={(e) => setInlineCategoryInput(e.target.value)}
                        placeholder="e.g. Exhaust & Emission"
                        className="flex-1 px-3 py-1.5 text-base rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={handleCreateInlineCategory}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg min-h-[44px] cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className={cn(
                      "w-full px-3.5 py-2.5 text-base rounded-xl border focus:outline-none focus:ring-2 min-h-[44px] bg-white",
                      formErrors.categoryId
                        ? "border-rose-400 focus:ring-rose-500"
                        : "border-slate-300 focus:ring-blue-600"
                    )}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
                {formErrors.categoryId && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.categoryId}</p>
                )}
              </div>

              {/* Image URL with Preset Pickers & Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/photo-..."
                  className={cn(
                    "w-full px-3.5 py-2.5 text-base rounded-xl border focus:outline-none focus:ring-2 min-h-[44px]",
                    formErrors.imageUrl
                      ? "border-rose-400 focus:ring-rose-500 bg-rose-50/50"
                      : "border-slate-300 focus:ring-blue-600 bg-white"
                  )}
                />
                {formErrors.imageUrl && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.imageUrl}</p>
                )}

                {/* Sample Presets */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">
                    Presets:
                  </span>
                  {SAMPLE_IMAGE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: p.url })}
                      className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md min-h-[36px] flex items-center cursor-pointer transition-colors"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Thumbnail Preview */}
                {formData.imageUrl && (
                  <div className="mt-2.5 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                      <Image
                        src={formData.imageUrl}
                        alt="Preview"
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-slate-600 truncate flex-1 font-medium">
                      Image Preview Available
                    </span>
                  </div>
                )}
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Specification / Vehicle Fitment (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="e.g. Compatible with Toyota Hiace KDH200 2005-2018"
                  className="w-full px-3.5 py-2.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white min-h-[44px]"
                />
              </div>

              {/* Stock Availability Toggle Switch */}
              <div className="pt-2 flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Stock Availability
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Shown as &quot;In Stock&quot; or &quot;Out of Stock&quot;
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, isAvailable: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[11px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPartModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-xs transition-all min-h-[44px] cursor-pointer"
                >
                  {editingPart ? "Save Changes" : "Create Auto Part"}
                </button>
              </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD CATEGORY MODAL ================= */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-xs">
                  <FolderPlus className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">Add New Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Body & Panels, Cooling & Heating"
                  className="w-full px-3.5 py-2.5 text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all min-h-[44px] cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      {deleteCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Delete Auto Part?
            </h3>
            <p className="text-xs text-slate-600 mb-2">
              Are you sure you want to remove{" "}
              <strong className="text-slate-800">{deleteCandidate.name}</strong> (
              <span className="font-mono text-xs text-slate-700">{deleteCandidate.partNumber}</span>) from
              the catalog?
            </p>
            <p className="text-[11px] text-slate-400 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm min-h-[44px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition-all min-h-[44px] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
