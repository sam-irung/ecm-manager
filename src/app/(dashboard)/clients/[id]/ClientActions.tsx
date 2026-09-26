'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  AlertTriangle,
  X,
} from 'lucide-react';
import { deleteClient, archiveClient, restoreClient } from '../actions';
import { useClientModalStore } from '@/lib/clientModalStore';

interface Props {
  client: {
    id: string;
    name: string;
    archived: boolean;
    quotesCount: number;
    projectsCount: number;
  };
}

export default function ClientActions({ client }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<
    'archive' | 'restore' | 'delete' | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { open } = useClientModalStore();

  const hasData = client.quotesCount > 0 || client.projectsCount > 0;

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    if (modal === 'archive') {
      await archiveClient(client.id);
      router.push('/clients');
    } else if (modal === 'restore') {
      await restoreClient(client.id);
      router.refresh();
    } else if (modal === 'delete') {
      const result = await deleteClient(client.id);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.push('/clients');
    }

    setModal(null);
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => open()}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:border-ecm-blue text-gray-700 hover:text-ecm-blue text-sm font-medium rounded-lg transition-colors"
        >
          <Pencil size={16} />
          Modifier
        </button>

        {client.archived ? (
          <button
            onClick={() => setModal('restore')}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 text-sm font-medium rounded-lg transition-colors"
          >
            <ArchiveRestore size={16} />
            Restaurer
          </button>
        ) : hasData ? (
          <button
            onClick={() => setModal('archive')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Archive size={16} />
            Archiver
          </button>
        ) : (
          <button
            onClick={() => setModal('delete')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
        )}
      </div>

      {/* Modale de confirmation */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  modal === 'delete'
                    ? 'bg-red-100'
                    : modal === 'archive'
                      ? 'bg-amber-100'
                      : 'bg-green-100'
                }`}
              >
                {modal === 'delete' ? (
                  <AlertTriangle size={20} className="text-red-600" />
                ) : modal === 'archive' ? (
                  <Archive size={20} className="text-amber-600" />
                ) : (
                  <ArchiveRestore size={20} className="text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-ecm-blue">
                  {modal === 'delete'
                    ? 'Supprimer ce client ?'
                    : modal === 'archive'
                      ? 'Archiver ce client ?'
                      : 'Restaurer ce client ?'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {modal === 'delete' && (
                    <>
                      Vous êtes sur le point de supprimer{' '}
                      <strong>{client.name}</strong>. Cette action est
                      irréversible.
                    </>
                  )}
                  {modal === 'archive' && (
                    <>
                      <strong>{client.name}</strong> a{' '}
                      {client.quotesCount} devis et {client.projectsCount}{' '}
                      chantier(s) associé(s). Il sera masqué des listes
                      actives mais son historique sera conservé.
                    </>
                  )}
                  {modal === 'restore' && (
                    <>
                      <strong>{client.name}</strong> réapparaîtra dans la
                      liste des clients actifs.
                    </>
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  setModal(null);
                  setError(null);
                }}
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
                onClick={() => {
                  setModal(null);
                  setError(null);
                }}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 ${
                  modal === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : modal === 'archive'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {loading
                  ? 'En cours...'
                  : modal === 'delete'
                    ? 'Supprimer définitivement'
                    : modal === 'archive'
                      ? 'Archiver'
                      : 'Restaurer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}