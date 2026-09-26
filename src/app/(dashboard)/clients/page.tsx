import Link from 'next/link';
import {
  Plus,
  Users,
  Phone,
  FileText,
  HardHat,
  Archive,
} from 'lucide-react';
import { getClients, getArchivedClientsCount } from './actions';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  const { archived } = await searchParams;
  const showArchived = archived === '1';

  const [clients, archivedCount] = await Promise.all([
    getClients(showArchived),
    getArchivedClientsCount(),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
            <Users size={28} />
            {showArchived ? 'Clients archivés' : 'Clients'}
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {clients.length} client{clients.length > 1 ? 's' : ''}{' '}
            {showArchived ? 'archivé' : 'enregistré'}
            {clients.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Link
            href={showArchived ? '/clients' : '/clients?archived=1'}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              showArchived
                ? 'bg-ecm-blue text-white hover:bg-ecm-blue/90'
                : 'bg-white border border-gray-300 text-gray-700 hover:border-ecm-blue hover:text-ecm-blue'
            }`}
          >
            <Archive size={16} />
            {showArchived
              ? 'Voir les actifs'
              : `Archivés (${archivedCount})`}
          </Link>

          <Link
            href="/clients/nouveau"
            className="flex items-center justify-center gap-2 bg-ecm-orange hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={20} />
            Nouveau client
          </Link>
        </div>
      </div>

      {/* Contenu */}
      {clients.length === 0 ? (
        <EmptyState showArchived={showArchived} />
      ) : (
        <>
          {/* Vue tableau — desktop */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Devis
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Chantiers
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                      {client.code}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-sm font-semibold text-ecm-blue hover:text-ecm-orange transition-colors"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-ecm-blue/10 text-ecm-blue font-medium px-2.5 py-1 rounded-full">
                        {client.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client._count.quotes}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client._count.projects}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(client.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vue cartes — mobile + tablette */}
          <div className="lg:hidden space-y-3">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-ecm-orange/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ecm-blue truncate">
                      {client.name}
                    </p>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">
                      {client.code}
                    </p>
                  </div>
                  <span className="text-xs bg-ecm-blue/10 text-ecm-blue font-medium px-2.5 py-1 rounded-full shrink-0">
                    {client.type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{client.phone}</span>
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} className="text-ecm-orange" />
                    <span>{client._count.quotes} devis</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HardHat size={14} className="text-ecm-orange" />
                    <span>
                      {client._count.projects} chantier
                      {client._count.projects > 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="ml-auto text-gray-400">
                    {formatDate(client.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ showArchived }: { showArchived: boolean }) {
  if (showArchived) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <Archive size={28} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-ecm-blue mb-2">
          Aucun client archivé
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
          Les clients archivés apparaîtront ici.
        </p>
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 bg-ecm-blue hover:bg-ecm-blue/90 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <Users size={20} />
          Voir les clients actifs
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ecm-orange/10 mb-4">
        <Users size={28} className="text-ecm-orange" />
      </div>
      <h3 className="text-lg font-semibold text-ecm-blue mb-2">
        Aucun client pour l'instant
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
        Commencez par ajouter votre premier client. Vous pourrez ensuite lui
        créer des devis et suivre ses chantiers.
      </p>
      <Link
        href="/clients/nouveau"
        className="inline-flex items-center gap-2 bg-ecm-orange hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        <Plus size={20} />
        Ajouter mon premier client
      </Link>
    </div>
  );
}