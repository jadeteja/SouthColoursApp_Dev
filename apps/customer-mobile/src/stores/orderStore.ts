import { create } from 'zustand';

export interface OrderItem {
  name: string;
  size: string;
  price: number;
  quantity?: number;
  imageUrl?: string;
}

export interface CustomerOrder {
  id: string | number;
  orderNumber: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  statusColor?: string;
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: {
    name: string;
    street: string;
    cityStatePin: string;
    phone: string;
  };
  trackingId?: string;
  carrier?: string;
  items: OrderItem[];
}

interface OrderStore {
  orders: CustomerOrder[];
  addOrder: (order: CustomerOrder) => void;
  getOrderByNumber: (orderNumber: string) => CustomerOrder | undefined;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  addOrder: (order) => {
    set((state) => ({
      orders: [order, ...state.orders],
    }));
  },
  getOrderByNumber: (orderNumber) => {
    const cleanNum = orderNumber.replace(/^#/, '').trim().toLowerCase();
    return get().orders.find(
      (o) => o.orderNumber.replace(/^#/, '').trim().toLowerCase() === cleanNum
    );
  },
  clearOrders: () => {
    set({ orders: [] });
  },
}));
