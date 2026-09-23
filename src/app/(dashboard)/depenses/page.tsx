import Link from 'next/link';
import { Receipt, TrendingDown } from 'lucide-react';
import { getAllExpenses } from './actions';
import { formatFC, formatUSD, formatDate } from '@/lib/format';
import { getExchangeRate } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function DepensesPage() {
  const [expenses, exchangeRate] = await Promise.all([
    getAllExpenses(),
    getExchangeRate(),
  ]);

  const totalFc = expenses.reduce(
    (sum, e) =>
      sum + (e.currency === 'FC' ? e.amount : e.amount * exchangeRate),
    0
  );

  // Répartition par catégorie
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    const amountFc =
      e.currency === 'FC' ? e.amount : e.amount * exchangeRate;
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + amountFc);
  }
  const categoriesSorted = Array.from(byCategory.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
            <Receipt size={28} />
            Dépenses
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {expenses.length} dépense{expenses.length > 1 ? 's' : ''}{' '}
            enregistrée{expenses.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-br from-red-600 to-red-500 text-white rounded-xl p-5 sm:p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
          <TrendingDown size={14} />
          Total dépensé
        </div>
        <p className="text-2xl sm:text-3xl font-bold">{formatFC(totalFc)}</p>
        <p className="text-sm text-white/80 mt-1">
          ≈ {formatUSD(totalFc / exchangeRate)}
        </p>
      </div>

      {/* Répartition par catégorie */}
      {categoriesSorted.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue mb-4">
            Répartition par catégorie
          </h2>
          <div className="space-y-3">
            {categoriesSorted.map(([category, amount]) => {
              const percent = totalFc > 0 ? (amount / totalFc) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-ecm-text">
                      {category}
                    </span>
                    <div className="text-right">
                      <span className="font-semibold text-ecm-blue">
                        {formatFC(amount)}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ecm-orange rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ecm-orange/10 mb-4">
            <Receipt size={28} className="text-ecm-orange" />
          </div>
          <h3 className="text-lg font-semibold text-ecm-blue mb-2">
            Aucune dépense enregistrée
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Les dépenses se font depuis la page d'un chantier. Va sur un
            chantier pour enregistrer une dépense.
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
                    Catégorie
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(e.date)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/chantiers/${e.project.id}`}
                        className="text-sm font-mono font-semibold text-ecm-blue hover:text-ecm-orange"
                      >
                        {e.project.projectCode}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-ecm-blue/5 text-ecm-blue px-2 py-1 rounded-full">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 max-w-xs truncate">
                      {e.description}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-red-600 text-right whitespace-nowrap">
                      - {e.currency === 'FC' ? formatFC(e.amount) : formatUSD(e.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartes mobile */}
          <div className="lg:hidden space-y-3">
            {expenses.map((e) => (
              <Link
                key={e.id}
                href={`/chantiers/${e.project.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-red-200 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-ecm-blue">
                      {e.project.projectCode}
                    </p>
                    <p className="text-sm text-gray-700 truncate mt-1">
                      {e.description}
                    </p>
                  </div>
                  <span className="text-xs bg-ecm-blue/5 text-ecm-blue px-2 py-1 rounded-full shrink-0">
                    {e.category}
                  </span>
                </div>
                <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {formatDate(e.date)}
                  </span>
                  <p className="text-sm font-bold text-red-600">
                    - {e.currency === 'FC'
                      ? formatFC(e.amount)
                      : formatUSD(e.amount)}
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