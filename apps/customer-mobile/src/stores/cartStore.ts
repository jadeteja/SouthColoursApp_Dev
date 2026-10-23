import { create } from 'zustand';

export interface CartItem {
  id: string; // product-id + size (composite unique key)
  productId: number;
  name: string;
  size: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const compositeId = `${item.productId}-${item.size}`;
    const existing = get().items.find((i) => i.id === compositeId);

    if (existing) {
      set({
        items: get().items.map((i) =>
          i.id === compositeId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      });
    } else {
      set({
        items: [...get().items, { ...item, id: compositeId }],
      });
    }
  },

  updateQuantity: (id, delta) => {
    set({
      items: get().items
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    });
  },

  removeItem: (id) => {
    set({
      items: get().items.filter((i) => i.id !== id),
    });
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
