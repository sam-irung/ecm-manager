import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { getQuotes } from './actions';
import { formatDate, formatFC, formatUSD } from '@/lib/format';
import QuoteStatusBadge from './QuoteStatusBadge';

export const dynamic = 'force-dynamic';

export default async function DevisPage() {
  const quotes = await getQuotes();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
            <FileText size={28} />
            Devis
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {quotes.length} devis enregistré{quotes.length > 1 ? 's' : ''}
          </p>
        </div>

        <Link
          href="/devis/nouveau"
          className="flex items-center justify-center gap-2 bg-ecm-orange hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus size={20} />
          Nouveau devis
        </Link>
      </div>

      {quotes.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Tableau desktop */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    N° Devis
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Projet
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total FC
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total USD
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/devis/${quote.id}`}
                        className="text-sm font-mono font-semibold text-ecm-blue hover:text-ecm-orange transition-colors"
                      >
                        {quote.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {quote.client.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {quote.projectName}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(quote.date)}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-ecm-blue text-right">
                      {formatFC(quote.totalFc)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 text-right">
                      ≈ {formatUSD(quote.totalUsd)}
                    </td>
                    <td className="px-5 py-4">
                      <QuoteStatusBadge status={quote.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartes mobile */}
          <div className="lg:hidden space-y-3">
            {quotes.map((quote) => (
              <Link
                key={quote.id}
                href={`/devis/${quote.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-ecm-orange/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-ecm-blue">
                      {quote.quoteNumber}
                    </p>
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {quote.client.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {quote.projectName}
                    </p>
                  </div>
                  <QuoteStatusBadge status={quote.status} />
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {formatDate(quote.date)}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-ecm-blue">
                      {formatFC(quote.totalFc)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ≈ {formatUSD(quote.totalUsd)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ecm-orange/10 mb-4">
        <FileText size={28} className="text-ecm-orange" />
      </div>
      <h3 className="text-lg font-semibold text-ecm-blue mb-2">
        Aucun devis pour l'instant
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
        Créez votre premier devis. Chaque devis peut être converti en chantier
        dès que le client accepte.
      </p>
      <Link
        href="/devis/nouveau"
        className="inline-flex items-center gap-2 bg-ecm-orange hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        <Plus size={20} />
        Créer mon premier devis
      </Link>
    </div>
  );
}