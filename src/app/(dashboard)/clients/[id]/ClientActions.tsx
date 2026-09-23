'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, AlertTriangle, X } from 'lucide-react';
import { deleteClient } from '../actions';
import { useClientModalStore } from '@/lib/clientModalStore';

interface Props {
  client: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    type: string;
    notes: string | null;
    quotesCount: number;
    projectsCount: number;
  };
}

export default function ClientActions({ client }: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { open } = useClientModalStore();

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const result = await deleteClient(client.id);

    if (result?.error) {
      setError(result.error);
      setDeleting(false);
      return;
    }

    router.push('/clients');
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => open()}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-ecm-blue text-gray-700 hover:text-ecm-blue text-sm font-medium rounded-lg transition-colors"
        >
          <Pencil size={16} />
          Modifier
        </button>
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors"
        >
          <Trash2 size={16} />
          Supprimer
        </button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ecm-blue">
                  Supprimer ce client ?
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Vous êtes sur le point de supprimer{' '}
                  <strong>{client.name}</strong>. Cette action est irréversible.
                </p>
              </div>
              <button
                onClick={() => setConfirmOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
              >
                {deleting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}