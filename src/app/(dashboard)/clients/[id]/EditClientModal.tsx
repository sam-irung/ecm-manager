'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useClientModalStore } from '@/lib/clientModalStore';
import { updateClient } from '../actions';

interface Props {
  client: {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    type: string;
    notes: string;
  };
}

const inputClass =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all';

export default function EditClientModal({ client }: Props) {
  const router = useRouter();
  const { isOpen, close } = useClientModalStore();
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setError(null);
    }
  }, [isOpen]);

  async function handleSubmit(formData: FormData) {
    setStatus('saving');
    setError(null);

    const result = await updateClient(client.id, formData);

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
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-ecm-blue">
            Modifier le client
          </h3>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

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
              Client mis à jour avec succès.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                defaultValue={client.name}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                defaultValue={client.phone}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                defaultValue={client.email}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Adresse
              </label>
              <input
                name="address"
                defaultValue={client.address}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Type
              </label>
              <select
                name="type"
                defaultValue={client.type}
                className={inputClass}
              >
                <option value="Particulier">Particulier</option>
                <option value="Entreprise">Entreprise</option>
                <option value="Commerce">Commerce</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Notes internes
              </label>
              <textarea
                name="notes"
                defaultValue={client.notes}
                rows={3}
                className={inputClass + ' resize-none'}
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
      </div>
    </div>
  );
}