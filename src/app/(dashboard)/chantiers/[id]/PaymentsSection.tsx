'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { addPayment, deletePayment } from '../actions';
import { formatFC, formatUSD, formatDate } from '@/lib/format';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  method: string;
  reference: string | null;
  notes: string | null;
  paymentDate: string;
}

interface Props {
  projectId: string;
  payments: Payment[];
  exchangeRate: number;
}

const inputClass =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all';

export default function PaymentsSection({
  projectId,
  payments,
  exchangeRate,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalFc = payments.reduce(
    (sum, p) =>
      sum + (p.currency === 'FC' ? p.amount : p.amount * exchangeRate),
    0
  );

  async function handleSubmit(formData: FormData) {
    setStatus('saving');
    setError(null);

    const result = await addPayment(projectId, formData);

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
    if (!confirm('Supprimer ce paiement ?')) return;
    setDeletingId(id);
    await deletePayment(id, projectId);
    router.refresh();
    setDeletingId(null);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue flex items-center gap-2">
            <Wallet size={16} />
            Paiements ({payments.length})
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Total encaissé : <strong>{formatFC(totalFc)}</strong>
          </p>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-3 py-2 bg-ecm-orange hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors"
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
              Paiement enregistré.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
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
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Devise
              </label>
              <select name="currency" defaultValue="FC" className={inputClass}>
                <option value="FC">FC</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Mode de paiement
              </label>
              <select name="method" defaultValue="Espèces" className={inputClass}>
                <option value="Espèces">Espèces</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Virement">Virement</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Référence (optionnel)
              </label>
              <input
                type="text"
                name="reference"
                placeholder="N° transaction, bordereau..."
                className={inputClass}
              />
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
              className="px-4 py-2 bg-ecm-orange hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors"
            >
              {status === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {payments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Aucun paiement enregistré.
        </p>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ecm-blue">
                    {p.currency === 'FC'
                      ? formatFC(p.amount)
                      : formatUSD(p.amount)}
                  </span>
                  <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                    {p.method}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Calendar size={12} />
                  {formatDate(p.paymentDate)}
                  {p.reference && (
                    <>
                      <span>·</span>
                      <span className="font-mono truncate">{p.reference}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                disabled={deletingId === p.id}
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