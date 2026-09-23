import Link from 'next/link';
import { Wallet, TrendingUp } from 'lucide-react';
import { getAllPayments } from './actions';
import { formatFC, formatUSD, formatDate } from '@/lib/format';
import { getExchangeRate } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function PaiementsPage() {
  const [payments, exchangeRate] = await Promise.all([
    getAllPayments(),
    getExchangeRate(),
  ]);

  // Calculs
  const totalFc = payments.reduce(
    (sum, p) =>
      sum + (p.currency === 'FC' ? p.amount : p.amount * exchangeRate),
    0
  );

  // Groupement par mois pour un mini-résumé
  const byMonth = new Map<string, number>();
  for (const p of payments) {
    const month = new Date(p.paymentDate).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    });
    const amountFc =
      p.currency === 'FC' ? p.amount : p.amount * exchangeRate;
    byMonth.set(month, (byMonth.get(month) ?? 0) + amountFc);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
            <Wallet size={28} />
            Paiements
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {payments.length} paiement{payments.length > 1 ? 's' : ''}{' '}
            enregistré{payments.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-br from-ecm-blue to-ecm-blue/90 text-white rounded-xl p-5 sm:p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-2 text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
          <TrendingUp size={14} />
          Total encaissé
        </div>
        <p className="text-2xl sm:text-3xl font-bold">{formatFC(totalFc)}</p>
        <p className="text-sm text-ecm-orange mt-1">
          ≈ {formatUSD(totalFc / exchangeRate)}
        </p>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ecm-orange/10 mb-4">
            <Wallet size={28} className="text-ecm-orange" />
          </div>
          <h3 className="text-lg font-semibold text-ecm-blue mb-2">
            Aucun paiement enregistré
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Les paiements se font depuis la page d'un chantier. Va sur un
            chantier pour enregistrer un paiement.
          </p>
        </div>
      ) : (
        <>
          {/* Tableau desktop */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Chantier
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/chantiers/${p.project.id}`}
                        className="text-sm font-mono font-semibold text-ecm-blue hover:text-ecm-orange"
                      >
                        {p.project.projectCode}
                      </Link>
                      <p className="text-xs text-gray-500 truncate">
                        {p.project.name}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {p.project.client.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {p.method}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-ecm-blue text-right whitespace-nowrap">
                      {p.currency === 'FC'
                        ? formatFC(p.amount)
                        : formatUSD(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartes mobile */}
          <div className="lg:hidden space-y-3">
            {payments.map((p) => (
              <Link
                key={p.id}
                href={`/chantiers/${p.project.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-ecm-orange/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-ecm-blue">
                      {p.project.projectCode}
                    </p>
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {p.project.client.name}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full shrink-0">
                    {p.method}
                  </span>
                </div>
                <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {formatDate(p.paymentDate)}
                  </span>
                  <p className="text-sm font-bold text-ecm-blue">
                    {p.currency === 'FC'
                      ? formatFC(p.amount)
                      : formatUSD(p.amount)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}