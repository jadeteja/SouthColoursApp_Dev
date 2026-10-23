import { create } from 'zustand';

export interface CategoryNode {
  id: number;
  name: string;
  subcategories: string[];
}

interface CategoryState {
  categories: CategoryNode[];
  addCategory: (name: string, subcategories?: string[]) => void;
  updateCategory: (categoryId: number, newName: string) => void;
  addSubcategory: (categoryId: number, subcategory: string) => void;
  updateSubcategory: (categoryId: number, oldSub: string, newSub: string) => void;
  removeSubcategory: (categoryId: number, subcategory: string) => void;
  removeCategory: (categoryId: number) => void;
  syncFromBackend: (backendCats: any[]) => void;
}

export const initialCategories: CategoryNode[] = [
  { id: 11, name: 'Frocks', subcategories: ['Below Knee Length Frock', 'Long Frock'] },
  { id: 14, name: 'Lehenga Blouse', subcategories: ['Lehenga Blouse With Aari'] },
  { id: 16, name: 'Lehenga Crop Top Blouse', subcategories: [] },
  { id: 17, name: 'Kurta Dhoti', subcategories: [] },
  { id: 9, name: 'Mother and Daughter Combo', subcategories: [] },
  { id: 18, name: 'Brother and Sister Combo', subcategories: [] },
  { id: 10, name: 'Family Combo', subcategories: [] },
  { id: 19, name: 'Offer Dresses', subcategories: [] },
];

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: initialCategories,
  syncFromBackend: (backendCats: any[]) =>
    set((state) => {
      if (!Array.isArray(backendCats) || backendCats.length === 0) return state;

      // Merge backend categories with existing subcategories
      const merged: CategoryNode[] = backendCats.map((bc) => {
        const existing = state.categories.find(
          (c) => c.name.toLowerCase() === (bc.name || '').toLowerCase()
        );
        const backendSubs = Array.isArray(bc.subcategories)
          ? bc.subcategories.map((s: any) => s.name || s)
          : [];
        const combinedSubs = Array.from(
          new Set([...(existing?.subcategories || []), ...backendSubs])
        );

        return {
          id: bc.id,
          name: bc.name,
          subcategories: combinedSubs,
        };
      });

      // Keep any custom categories created locally that aren't in backend yet
      const mergedNames = new Set(merged.map((m) => m.name.toLowerCase()));
      state.categories.forEach((c) => {
        if (!mergedNames.has(c.name.toLowerCase())) {
          merged.push(c);
        }
      });

      return { categories: merged };
    }),
  addCategory: (name, subcategories = []) =>
    set((state) => ({
      categories: [
        ...state.categories,
        { id: Date.now(), name, subcategories },
      ],
    })),
  updateCategory: (categoryId, newName) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId ? { ...c, name: newName } : c
      ),
    })),
  addSubcategory: (categoryId, subcategory) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? { ...c, subcategories: [...c.subcategories, subcategory] }
          : c
      ),
    })),
  updateSubcategory: (categoryId, oldSub, newSub) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories.map((s) => (s === oldSub ? newSub : s)),
            }
          : c
      ),
    })),
  removeSubcategory: (categoryId, subcategory) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              subcategories: c.subcategories.filter((s) => s !== subcategory),
            }
          : c
      ),
    })),
  removeCategory: (categoryId) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== categoryId),
    })),
}));
