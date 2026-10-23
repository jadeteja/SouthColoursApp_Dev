import { create } from 'zustand';

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: number) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (id: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addItem: (item) => {
    if (!get().items.some((i) => i.id === item.id)) {
      set({ items: [...get().items, item] });
    }
  },
  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },
  toggleItem: (item) => {
    const exists = get().items.some((i) => i.id === item.id);
    if (exists) {
      set({ items: get().items.filter((i) => i.id !== item.id) });
    } else {
      set({ items: [...get().items, item] });
    }
  },
  isInWishlist: (id) => {
    return get().items.some((i) => i.id === id);
  },
  clearWishlist: () => set({ items: [] }),
}));
