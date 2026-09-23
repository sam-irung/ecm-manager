'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCategoryModalStore } from '@/lib/catalogModalStore';
import { createCategory, updateCategory, getCategory } from './actions';

const inputClass =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all';

export default function CategoryModal() {
  const router = useRouter();
  const { isOpen, editingId, close } = useCategoryModalStore();
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<{
    name: string;
    icon: string;
    order: number;
  }>({ name: '', icon: '', order: 0 });

  // Charger si édition
  useEffect(() => {
    if (isOpen && editingId) {
      setLoading(true);
      getCategory(editingId).then((data) => {
        if (data) {
          setCategory({
            name: data.name,
            icon: data.icon ?? '',
            order: data.order,
          });
        }
        setLoading(false);
      });
    } else if (isOpen && !editingId) {
      setCategory({ name: '', icon: '', order: 0 });
    }
    setStatus('idle');
    setError(null);
  }, [isOpen, editingId]);

  async function handleSubmit(formData: FormData) {
    setStatus('saving');
    setError(null);

    const result = editingId
      ? await updateCategory(editingId, formData)
      : await createCategory(formData);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-ecm-blue">
            {editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
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
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                defaultValue={category.name}
                required
                placeholder="Ex : Plafond, Électricité..."
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Icône (nom lucide)
                </label>
                <input
                  name="icon"
                  defaultValue={category.icon}
                  placeholder="Ex : Layers"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  name="order"
                  defaultValue={category.order}
                  min="0"
                  className={inputClass}
                />
              </div>
            </div>

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