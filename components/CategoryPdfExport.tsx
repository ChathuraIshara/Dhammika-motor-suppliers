"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Category, AutoPart } from "@/data/mockData";
import { formatLKR } from "@/lib/utils";
import { FileText, Download, X, CheckCircle2, ChevronDown } from "lucide-react";

interface CategoryPdfExportProps {
  categories: Category[];
  parts: AutoPart[];
}

const loadImageAsDataUrl = async (source: string): Promise<string | null> => {
  if (source.startsWith("data:image/")) return source;

  try {
    const response = await fetch(source);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export default function CategoryPdfExport({
  categories,
  parts,
}: CategoryPdfExportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedCategoryName =
    selectedCategoryId === "all"
      ? "All Categories"
      : categories.find((c) => c.id === selectedCategoryId)?.name || "Parts Catalog";

  const filteredParts =
    selectedCategoryId === "all"
      ? parts
      : parts.filter((p) => p.categoryId === selectedCategoryId);

  const handleGeneratePdf = async () => {
    try {
      setIsGenerating(true);

      // Create new jsPDF instance (A4 size, portrait, mm units)
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;

      // Centered printable header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text("Dhammika Motor Suppliers", pageWidth / 2, 18, { align: "center" });

      doc.setFontSize(12);
      doc.text(selectedCategoryName, margin, 27);

      const imageData = await Promise.all(filteredParts.map((part) => loadImageAsDataUrl(part.imageUrl)));
      const tableRows = filteredParts.map((part) => [
        part.partNumber,
        part.name,
        formatLKR(part.price),
        "",
      ]);

      const headers = [["Part No.", "Part Name", "Price (LKR)", "Image"]];

      // AutoTable generation
      autoTable(doc, {
        head: headers,
        body: tableRows,
        startY: 34,
        margin: { left: margin, right: margin, bottom: 20 },
        theme: "grid",
        styles: {
          lineColor: [0, 0, 0],
          lineWidth: 0.25,
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontSize: 11,
          fontStyle: "bold",
          halign: "center",
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 11,
          textColor: [0, 0, 0],
          cellPadding: 4,
          minCellHeight: 25,
          valign: "middle",
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255],
        },
        columnStyles: {
          0: { cellWidth: 42, fontStyle: "bold", textColor: [0, 0, 0] },
          1: { cellWidth: "auto", fontSize: 12 },
          2: { cellWidth: 36, halign: "right", fontStyle: "bold", textColor: [0, 0, 0] },
          3: { cellWidth: 28, halign: "center" },
        },
        didDrawCell: (data) => {
          if (data.section === "body" && data.column.index === 3) {
            const image = imageData[data.row.index];
            if (image) {
              const imageSize = 17;
              doc.addImage(
                image,
                image.startsWith("data:image/png") ? "PNG" : "JPEG",
                data.cell.x + (data.cell.width - imageSize) / 2,
                data.cell.y + (data.cell.height - imageSize) / 2,
                imageSize,
                imageSize
              );
            }
          }
        },
        didDrawPage: () => {
          const totalPagesExp = "{total_pages_count_string}";
          const pageNumber = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
          
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
          
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.3);
          doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

          doc.text(
            "Dhammika Motor Suppliers • Confidential • Prices subject to change without prior notice.",
            margin,
            pageHeight - 7
          );

          const pageStr = `Page ${pageNumber} of ${totalPagesExp}`;
          doc.text(pageStr, pageWidth - margin, pageHeight - 7, { align: "right" });
        },
      });

      // Replace total pages placeholder
      if (typeof doc.putTotalPages === "function") {
        doc.putTotalPages("{total_pages_count_string}");
      }

      // Download file with clean filename
      const cleanCatName = selectedCategoryName
        .replace(/[^a-zA-Z0-9]/g, "_")
        .replace(/_+/g, "_");
      const filename = `Dhammika_Motor_Suppliers_${cleanCatName}.pdf`;

      doc.save(filename);

      setSuccessMessage(`Exported ${filteredParts.length} parts to ${filename}`);
      setTimeout(() => {
        setSuccessMessage(null);
        setIsOpen(false);
      }, 1800);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold shadow-sm shadow-blue-600/20 transition-all text-xs sm:text-sm min-h-[44px] cursor-pointer"
        type="button"
      >
        <FileText className="w-4 h-4" />
        <span>📄 Download Category PDF</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-blue-50/80 border-b border-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    Generate Printable PDF
                  </h3>
                  <p className="text-xs text-blue-600 font-medium">
                    Category-wise inventory price sheet (A4)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-blue-100/60 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {successMessage ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <p className="text-blue-900 font-bold text-sm">
                    {successMessage}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="pdf-category-select"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                    >
                      Select Category to Export
                    </label>
                    <div className="relative">
                      <select
                        id="pdf-category-select"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full appearance-none px-3.5 py-2.5 pr-11 text-base rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white shadow-xs min-h-[44px]"
                      >
                        <option value="all">
                          All Categories ({parts.length} items)
                        </option>
                        {categories.map((cat) => {
                          const count = parts.filter((p) => p.categoryId === cat.id).length;
                          return (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} ({count} items)
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Selected Category:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedCategoryName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Matching Items:</span>
                      <span className="font-semibold text-blue-600">
                        {filteredParts.length} parts
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Document Format:</span>
                      <span className="font-medium text-slate-700">
                        Printable A4 with Header & Pagination
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Filename:</span>
                      <span className="font-mono text-[11px] text-blue-700 font-semibold truncate max-w-[200px]">
                        Dhammika_Motor_Suppliers_{selectedCategoryName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm min-h-[44px] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isGenerating || filteredParts.length === 0}
                      onClick={handleGeneratePdf}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-blue-600/25 transition-all min-h-[44px] cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isGenerating ? "Generating..." : "Download PDF"}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
