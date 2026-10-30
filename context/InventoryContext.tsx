"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AutoPart, Category, INITIAL_CATEGORIES, INITIAL_PARTS } from "@/data/mockData";

interface InventoryContextType {
  categories: Category[];
  parts: AutoPart[];
  addPart: (part: Omit<AutoPart, "id">) => void;
  updatePart: (id: string, part: Partial<AutoPart>) => void;
  deletePart: (id: string) => void;
  toggleAvailability: (id: string) => void;
  addCategory: (name: string) => Category;
  resetToMockData: () => void;
  isLoaded: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY_PARTS = "dhammika_parts_catalog_v1";
const STORAGE_KEY_CATS = "dhammika_categories_v1";

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [parts, setParts] = useState<AutoPart[]>(INITIAL_PARTS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedParts = localStorage.getItem(STORAGE_KEY_PARTS);
        const savedCats = localStorage.getItem(STORAGE_KEY_CATS);

        if (savedParts) {
          setParts(JSON.parse(savedParts));
        }
        if (savedCats) {
          setCategories(JSON.parse(savedCats));
        }
      } catch (e) {
        console.error("Failed to load inventory from localStorage:", e);
      } finally {
        setIsLoaded(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_PARTS, JSON.stringify(parts));
    } catch (e) {
      console.error("Failed to save parts to localStorage:", e);
    }
  }, [parts, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(categories));
    } catch (e) {
      console.error("Failed to save categories to localStorage:", e);
    }
  }, [categories, isLoaded]);

  const addPart = (newPartData: Omit<AutoPart, "id">) => {
    const newPart: AutoPart = {
      ...newPartData,
      id: `part-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setParts((prev) => [newPart, ...prev]);
  };

  const updatePart = (id: string, updatedFields: Partial<AutoPart>) => {
    setParts((prev) =>
      prev.map((part) => {
        if (part.id === id) {
          const updated = { ...part, ...updatedFields };
          if (updatedFields.categoryId && updatedFields.categoryId !== part.categoryId) {
            const cat = categories.find((c) => c.id === updatedFields.categoryId);
            if (cat) updated.categoryName = cat.name;
          }
          return updated;
        }
        return part;
      })
    );
  };

  const deletePart = (id: string) => {
    setParts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p))
    );
  };

  const addCategory = (name: string): Category => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = categories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug: slug || `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const resetToMockData = () => {
    setCategories(INITIAL_CATEGORIES);
    setParts(INITIAL_PARTS);
    try {
      localStorage.removeItem(STORAGE_KEY_PARTS);
      localStorage.removeItem(STORAGE_KEY_CATS);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        categories,
        parts,
        addPart,
        updatePart,
        deletePart,
        toggleAvailability,
        addCategory,
        resetToMockData,
        isLoaded,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
