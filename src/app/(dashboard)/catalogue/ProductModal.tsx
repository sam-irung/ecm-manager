'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProductModalStore } from '@/lib/catalogModalStore';
import { createProduct, updateProduct, getProduct } from './actions';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  defaultUnit: string;
}

const inputClass =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all';

export default function ProductModal({ categories, defaultUnit }: Props) {
  const router = useRouter();
  const { isOpen, editingId, defaultCategoryId, close } = useProductModalStore();
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: '',
    description: '',
    unit: defaultUnit,
    priceFc: 0,
    priceUsd: '' as string | number,
    categoryId: defaultCategoryId ?? categories[0]?.id ?? '',
    active: true,
  });

  useEffect(() => {
    if (isOpen && editingId) {
      setLoading(true);
      getProduct(editingId).then((data) => {
        if (data) {
          setProduct({
            name: data.name,
            description: data.description ?? '',
            unit: data.unit,
            priceFc: data.priceFc,
            priceUsd: data.priceUsd ?? '',
            categoryId: data.categoryId,
            active: data.active,
          });
        }
        setLoading(false);
      });
    } else if (isOpen && !editingId) {
      setProduct({
        name: '',
        description: '',
        unit: defaultUnit,
        priceFc: 0,
        priceUsd: '',
        categoryId: defaultCategoryId ?? categories[0]?.id ?? '',
        active: true,
      });
    }
    setStatus('idle');
    setError(null);
  }, [isOpen, editingId, defaultCategoryId, defaultUnit, categories]);

  async function handleSubmit(formData: FormData) {
    setStatus('saving');
    setError(null);

    const result = editingId
      ? await updateProduct(editingId, formData)
      : await createProduct(formData);

    if (result?.error) {
      setError(result.error);
      setStatus('error');
      return;
    }

    setStatus('success');
    setTimeout(() => {
      close();
      router.refresh();
    }, 800);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full my-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-ecm-blue">
            {editingId ? 'Modifier le produit' : 'Nouveau produit'}
          </h3>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : (
          <form action={handleSubmit} className="p-5 space-y-4">
            {status === 'error' && error && (
              <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                <CheckCircle2 size={18} />
                Enregistré.
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                defaultValue={product.categoryId}
                required
                className={inputClass}
              >
                <option value="">— Sélectionner —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nom du produit <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                defaultValue={product.name}
                required
                placeholder="Ex : Gyproc, Spot LED..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={product.description}
                rows={2}
                placeholder="Détails optionnels..."
                className={inputClass + ' resize-none'}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Unité
                </label>
                <input
                  name="unit"
                  defaultValue={product.unit}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Prix FC <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="priceFc"
                  defaultValue={product.priceFc}
                  required
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Prix USD
                </label>
                <input
                  type="number"
                  name="priceUsd"
                  defaultValue={product.priceUsd}
                  min="0"
                  step="0.01"
                  placeholder="Optionnel"
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                defaultChecked={product.active}
                className="w-4 h-4 text-ecm-orange rounded focus:ring-ecm-orange"
              />
              <span className="text-sm text-gray-700">
                Produit actif (visible dans les devis)
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={status === 'saving'}
                className="flex items-center gap-2 px-5 py-2.5 bg-ecm-orange hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Save size={16} />
                {status === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}