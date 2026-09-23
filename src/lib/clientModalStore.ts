import { create } from 'zustand';

interface ClientModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useClientModalStore = create<ClientModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));