'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Package,
  Power,
} from 'lucide-react';
import {
  useCategoryModalStore,
  useProductModalStore,
} from '@/lib/catalogModalStore';
import { deleteCategory, deleteProduct, toggleProductActive } from './actions';
import { formatFC } from '@/lib/format';

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  priceFc: number;
  priceUsd: number | null;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
  order: number;
  products: Product[];
  _count: { products: number };
}

export default function CategoryBlock({
  category,
  defaultOpen,
}: {
  category: Category;
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [busy, setBusy] = useState(false);
  const catModal = useCategoryModalStore();
  const prodModal = useProductModalStore();

  async function handleDeleteCategory() {
    if (
      !confirm(
        `Supprimer la catégorie "${category.name}" ? Cette action est irréversible.`
      )
    )
      return;

    setBusy(true);
    const result = await deleteCategory(category.id);
    if (result?.error) {
      alert(result.error);
    }
    setBusy(false);
    router.refresh();
  }

  async function handleDeleteProduct(id: string, name: string) {
    if (!confirm(`Supprimer le produit "${name}" ?`)) return;

    setBusy(true);
    const result = await deleteProduct(id);
    if (result?.error) {
      alert(result.error);
    }
    setBusy(false);
    router.refresh();
  }

  async function handleToggle(id: string, currentActive: boolean) {
    await toggleProductActive(id, !currentActive);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* En-tête */}
      <div className="flex items-center gap-3 p-4 sm:p-5">
        <button
          onClick={() => setOpen(!open)}
          className="flex-1 flex items-center gap-3 text-left min-w-0"
        >
          <div className="w-10 h-10 rounded-lg bg-ecm-blue/5 flex items-center justify-center shrink-0">
            <Package size={18} className="text-ecm-blue" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-ecm-blue truncate">
              {category.name}
            </h3>
            <p className="text-xs text-gray-500">
              {category._count.products} produit
              {category._count.products > 1 ? 's' : ''}
            </p>
          </div>
          <ChevronDown
            size={20}
            className={`text-gray-400 shrink-0 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => prodModal.openCreate(category.id)}
            className="p-2 text-ecm-orange hover:bg-ecm-orange/10 rounded-lg transition-colors"
            title="Ajouter un produit"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => catModal.openEdit(category.id)}
            className="p-2 text-gray-500 hover:text-ecm-blue hover:bg-gray-100 rounded-lg transition-colors"
            title="Modifier la catégorie"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={handleDeleteCategory}
            disabled={busy}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Supprimer la catégorie"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Contenu */}
      {open && (
        <div className="border-t border-gray-100 bg-gray-50">
          {category.products.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Aucun produit dans cette catégorie.
              </p>
              <button
                onClick={() => prodModal.openCreate(category.id)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-ecm-orange hover:underline"
              >
                <Plus size={12} />
                Ajouter le premier produit
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {category.products.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-3 sm:p-4 ${
                    p.active ? '' : 'opacity-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ecm-text truncate">
                        {p.name}
                      </p>
                      {!p.active && (
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded shrink-0">
                          Inactif
                        </span>
                      )}
                    </div>
                    {p.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-ecm-blue whitespace-nowrap">
                      {formatFC(p.priceFc)}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      / {p.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggle(p.id, p.active)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        p.active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={p.active ? 'Désactiver' : 'Activer'}
                    >
                      <Power size={14} />
                    </button>
                    <button
                      onClick={() => prodModal.openEdit(p.id)}
                      className="p-1.5 text-gray-500 hover:text-ecm-blue hover:bg-gray-100 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      disabled={busy}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}