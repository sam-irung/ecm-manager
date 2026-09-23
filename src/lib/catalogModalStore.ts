import { create } from 'zustand';

// ============================================
// CATÉGORIE
// ============================================
interface CategoryModalState {
  isOpen: boolean;
  editingId: string | null;
  openCreate: () => void;
  openEdit: (id: string) => void;
  close: () => void;
}

export const useCategoryModalStore = create<CategoryModalState>((set) => ({
  isOpen: false,
  editingId: null,
  openCreate: () => set({ isOpen: true, editingId: null }),
  openEdit: (id) => set({ isOpen: true, editingId: id }),
  close: () => set({ isOpen: false, editingId: null }),
}));

// ============================================
// PRODUIT
// ============================================
interface ProductModalState {
  isOpen: boolean;
  editingId: string | null;
  defaultCategoryId: string | null;
  openCreate: (categoryId?: string) => void;
  openEdit: (id: string) => void;
  close: () => void;
}

export const useProductModalStore = create<ProductModalState>((set) => ({
  isOpen: false,
  editingId: null,
  defaultCategoryId: null,
  openCreate: (categoryId) =>
    set({
      isOpen: true,
      editingId: null,
      defaultCategoryId: categoryId ?? null,
    }),
  openEdit: (id) =>
    set({ isOpen: true, editingId: id, defaultCategoryId: null }),
  close: () => set({ isOpen: false, editingId: null, defaultCategoryId: null }),
}));