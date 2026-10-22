import { create } from 'zustand';

export interface CategoryNode {
  id: number;
  name: string;
  subcategories: string[];
}

interface CategoryState {
  categories: CategoryNode[];
  addCategory: (name: string, subcategories?: string[]) => void;
  addSubcategory: (categoryId: number, subcategory: string) => void;
  removeCategory: (categoryId: number) => void;
}

export const initialCategories: CategoryNode[] = [
  { id: 1, name: 'Girls', subcategories: ['Dresses', 'Tops', 'Bottoms', 'Ethnic Wear'] },
  { id: 2, name: 'Boys', subcategories: ['Ethnic Wear', 'T-Shirts', 'Shirts', 'Shorts', 'Sets'] },
  { id: 3, name: 'Baby Wear', subcategories: ['Frocks', 'Rompers', 'Sets'] },
  { id: 4, name: 'Ethnic Wear', subcategories: ['Lehenga Choli', 'Anarkali', 'Kurta Sets', 'Gowns'] },
  { id: 5, name: 'New Arrivals', subcategories: ['Latest Collections', 'Festive Edit'] },
  { id: 6, name: 'Offers', subcategories: ['Season Sale', 'Clearance'] },
];

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: initialCategories,
  addCategory: (name, subcategories = []) =>
    set((state) => ({
      categories: [
        ...state.categories,
        { id: Date.now(), name, subcategories },
      ],
    })),
  addSubcategory: (categoryId, subcategory) =>
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === categoryId
          ? { ...c, subcategories: [...c.subcategories, subcategory] }
          : c
      ),
    })),
  removeCategory: (categoryId) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== categoryId),
    })),
}));
