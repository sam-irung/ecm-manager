'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Receipt,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { addExpense, deleteExpense } from '../actions';
import { formatFC, formatUSD, formatDate } from '@/lib/format';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  notes: string | null;
  date: string;
}

interface Props {
  projectId: string;
  expenses: Expense[];
  exchangeRate: number;
}

const CATEGORIES = [
  'Matériaux',
  'Main-d\'œuvre',
  'Transport',
  'Restauration',
  'Location matériel',
  'Autres',
];

const inputClass =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all';

export default function ExpensesSection({
  projectId,
  expenses,
  exchangeRate,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalFc = expenses.reduce(
    (sum, e) =>
      sum + (e.currency === 'FC' ? e.amount : e.amount * exchangeRate),
    0
  );

  async function handleSubmit(formData: FormData) {
    setStatus('saving');
    setError(null);

    const result = await addExpense(projectId, formData);

    if (result?.error) {
      setError(result.error);
      setStatus('error');
      return;
    }

    setStatus('success');
    setTimeout(() => {
      setOpen(false);
      setStatus('idle');
      router.refresh();
    }, 800);
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette dépense ?')) return;
    setDeletingId(id);
    await deleteExpense(id, projectId);
    router.refresh();
    setDeletingId(null);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue flex items-center gap-2">
            <Receipt size={16} />
            Dépenses ({expenses.length})
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Total dépensé : <strong>{formatFC(totalFc)}</strong>
          </p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-2 bg-ecm-blue hover:bg-ecm-blue/90 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <Plus size={14} />
          Ajouter
        </button>
      </div>

      {open && (
        <form
          action={handleSubmit}
          className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3"
        >
          {status === 'error' && error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle2 size={16} />
              Dépense enregistrée.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Catégorie
              </label>
              <select name="category" defaultValue="Matériaux" className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Montant
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0"
                step="0.01"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                required
                placeholder="Ex : Achat 10 sacs de ciment"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Devise
              </label>
              <select name="currency" defaultValue="FC" className={inputClass}>
                <option value="FC">FC</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={status === 'saving'}
              className="px-4 py-2 bg-ecm-blue hover:bg-ecm-blue/90 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors"
            >
              {status === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {expenses.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Aucune dépense enregistrée.
        </p>
      ) : (
        <div className="space-y-2">
          {expenses.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ecm-blue">
                    {e.currency === 'FC'
                      ? formatFC(e.amount)
                      : formatUSD(e.amount)}
                  </span>
                  <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                    {e.category}
                  </span>
                </div>
                <p className="text-xs text-gray-700 mt-1 truncate">
                  {e.description}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Calendar size={12} />
                  {formatDate(e.date)}
                </div>
              </div>
              <button
                onClick={() => handleDelete(e.id)}
                disabled={deletingId === e.id}
                className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-50 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}