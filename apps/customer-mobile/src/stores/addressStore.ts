import { create } from 'zustand';

export interface DeliveryAddress {
  id: string;
  name: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface AddressState {
  currentAddress: DeliveryAddress | null;
  savedAddresses: DeliveryAddress[];
  setAddress: (addr: DeliveryAddress) => void;
  clearAddress: () => void;
}

export const useAddressStore = create<AddressState>((set) => ({
  currentAddress: null,
  savedAddresses: [],
  setAddress: (addr) => set({ currentAddress: addr }),
  clearAddress: () => set({ currentAddress: null }),
}));
