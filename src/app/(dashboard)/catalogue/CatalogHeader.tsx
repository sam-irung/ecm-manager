'use client';

import { Plus } from 'lucide-react';
import { useCategoryModalStore } from '@/lib/catalogModalStore';

export default function CatalogHeader() {
  const { openCreate } = useCategoryModalStore();

  return (
    <div className="flex justify-end mb-5">
      <button
        onClick={openCreate}
        className="flex items-center gap-2 bg-ecm-orange hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
      >
        <Plus size={18} />
        Nouvelle catégorie
      </button>
    </div>
  );
}