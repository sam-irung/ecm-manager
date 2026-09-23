import { create } from 'zustand';

interface QuoteModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useQuoteModalStore = create<QuoteModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));