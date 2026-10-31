"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AutoPart, Category } from "@/data/mockData";
import { supabase } from "@/lib/supabase";

interface InventoryContextType {
  categories: Category[];
  parts: AutoPart[];
  addPart: (part: Omit<AutoPart, "id">) => Promise<AutoPart | null>;
  updatePart: (id: string, part: Partial<AutoPart>) => Promise<boolean>;
  deletePart: (id: string) => Promise<boolean>;
  toggleAvailability: (id: string) => Promise<boolean>;
  addCategory: (name: string) => Promise<Category>;
  uploadPartImage: (file: File) => Promise<string>;
  resetToMockData: () => Promise<void>;
  refreshData: () => Promise<void>;
  isLoaded: boolean;
  isSupabaseConnected: boolean;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_KEY_PARTS = "dhammika_parts_catalog_v1";
const STORAGE_KEY_CATS = "dhammika_categories_v1";

interface DbPartRow {
  id: string;
  name: string;
  part_number: string;
  category_id: string;
  category_name: string;
  price: number | string;
  image_url: string;
  is_available: boolean;
  description?: string;
}

function dbToPart(row: DbPartRow): AutoPart {
  return {
    id: row.id,
    name: row.name,
    partNumber: row.part_number,
    categoryId: row.category_id,
    categoryName: row.category_name,
    price: Number(row.price),
    imageUrl: row.image_url,
    isAvailable: Boolean(row.is_available),
    description: row.description || "",
  };
}

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parts, setParts] = useState<AutoPart[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Load from Supabase
  const loadData = useCallback(async () => {
    try {
      // 1. Fetch categories from Supabase
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      // 2. Fetch parts from Supabase
      const { data: partsData, error: partsError } = await supabase
        .from("parts")
        .select("*")
        .order("created_at", { ascending: false });

      if (catError) console.warn("Supabase categories fetch error:", catError.message || catError);
      if (partsError) console.warn("Supabase parts fetch error:", partsError.message || partsError);

      if (!catError && !partsError && catData && partsData) {
        setCategories(catData as Category[]);
        setParts(partsData.map((p) => dbToPart(p as unknown as DbPartRow)));
        setIsSupabaseConnected(true);
        setIsLoaded(true);
        return;
      }
    } catch (err) {
      console.warn("Supabase load attempt encountered an error, falling back to local cache:", err);
    }

    // Fallback: Read from localStorage if offline
    try {
      const savedParts = localStorage.getItem(STORAGE_KEY_PARTS);
      const savedCats = localStorage.getItem(STORAGE_KEY_CATS);
      if (savedParts) setParts(JSON.parse(savedParts));
      if (savedCats) setCategories(JSON.parse(savedCats));
    } catch (e) {
      console.error("Local storage load error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Keep localStorage updated as fallback
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_PARTS, JSON.stringify(parts));
      localStorage.setItem(STORAGE_KEY_CATS, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [parts, categories, isLoaded]);

  // Upload image to Supabase Storage Bucket 'parts-images'
  const uploadPartImage = async (file: File): Promise<string> => {
    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${Date.now()}-${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("parts-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("parts-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error("Image upload failed:", err);
      throw err;
    }
  };

  // Add Part
  const addPart = async (newPartData: Omit<AutoPart, "id">): Promise<AutoPart | null> => {
    const newId = `part-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newPart: AutoPart = {
      ...newPartData,
      id: newId,
    };

    // Optimistic UI update
    setParts((prev) => [newPart, ...prev]);

    // Persist to Supabase if available
    try {
      const { error } = await supabase.from("parts").insert([
        {
          id: newPart.id,
          name: newPart.name,
          part_number: newPart.partNumber,
          category_id: newPart.categoryId,
          category_name: newPart.categoryName,
          price: newPart.price,
          image_url: newPart.imageUrl,
          is_available: newPart.isAvailable,
          description: newPart.description || "",
        },
      ]);
      if (error) {
        console.warn("Failed to insert into Supabase, kept in local state:", error.message);
      }
    } catch (err) {
      console.warn("Supabase insert error:", err);
    }

    return newPart;
  };

  // Update Part
  const updatePart = async (id: string, updatedFields: Partial<AutoPart>): Promise<boolean> => {
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

    try {
      const dbPayload: Record<string, unknown> = {};
      if (updatedFields.name !== undefined) dbPayload.name = updatedFields.name;
      if (updatedFields.partNumber !== undefined) dbPayload.part_number = updatedFields.partNumber;
      if (updatedFields.categoryId !== undefined) {
        dbPayload.category_id = updatedFields.categoryId;
        const matchedCat = categories.find((c) => c.id === updatedFields.categoryId);
        if (matchedCat) dbPayload.category_name = matchedCat.name;
      }
      if (updatedFields.price !== undefined) dbPayload.price = updatedFields.price;
      if (updatedFields.imageUrl !== undefined) dbPayload.image_url = updatedFields.imageUrl;
      if (updatedFields.isAvailable !== undefined) dbPayload.is_available = updatedFields.isAvailable;
      if (updatedFields.description !== undefined) dbPayload.description = updatedFields.description;

      const { error } = await supabase.from("parts").update(dbPayload).eq("id", id);
      if (error) console.warn("Supabase update error:", error.message);
      return !error;
    } catch (err) {
      console.warn("Supabase update exception:", err);
      return false;
    }
  };

  // Delete Part
  const deletePart = async (id: string): Promise<boolean> => {
    setParts((prev) => prev.filter((p) => p.id !== id));
    try {
      const { error } = await supabase.from("parts").delete().eq("id", id);
      if (error) console.warn("Supabase delete error:", error.message);
      return !error;
    } catch (err) {
      console.warn("Supabase delete exception:", err);
      return false;
    }
  };

  // Toggle Availability
  const toggleAvailability = async (id: string): Promise<boolean> => {
    const currentPart = parts.find((p) => p.id === id);
    if (!currentPart) return false;
    const newStatus = !currentPart.isAvailable;

    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: newStatus } : p))
    );

    try {
      const { error } = await supabase
        .from("parts")
        .update({ is_available: newStatus })
        .eq("id", id);
      if (error) console.warn("Supabase toggle availability error:", error.message);
      return !error;
    } catch (err) {
      console.warn("Supabase toggle error:", err);
      return false;
    }
  };

  // Add Category
  const addCategory = async (name: string): Promise<Category> => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = categories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug: slug || `cat-${Date.now()}`,
    };

    setCategories((prev) => [...prev, newCat]);

    try {
      const { error } = await supabase.from("categories").insert([newCat]);
      if (error) console.warn("Supabase category insert error:", error.message);
    } catch (err) {
      console.warn("Supabase category exception:", err);
    }

    return newCat;
  };

  // Reset / Clear local cache and reload fresh from database
  const resetToMockData = async () => {
    try {
      localStorage.removeItem(STORAGE_KEY_PARTS);
      localStorage.removeItem(STORAGE_KEY_CATS);
      await loadData();
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
        uploadPartImage,
        resetToMockData,
        refreshData: loadData,
        isLoaded,
        isSupabaseConnected,
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
