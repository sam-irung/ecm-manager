import Link from 'next/link';
import {
  Users,
  FileText,
  HardHat,
  Wallet,
  Receipt,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getDashboardStats } from './dashboard-actions';
import { formatFC, formatUSD, formatDate } from '@/lib/format';
import QuoteStatusBadge from './devis/QuoteStatusBadge';
import ProjectStatusBadge from './chantiers/ProjectStatusBadge';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { stats, recentQuotes, recentProjects, exchangeRate } =
    await getDashboardStats();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue">
          Tableau de bord
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Vue d'ensemble de l'activité ECM
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
        <StatCard
          icon={<Users size={20} />}
          label="Clients"
          value={stats.clients.toString()}
          href="/clients"
        />
        <StatCard
          icon={<FileText size={20} />}
          label="Devis"
          value={stats.quotes.toString()}
          href="/devis"
          subtitle={`${stats.quotesPending} en cours · ${stats.quotesAccepted} acceptés`}
        />
        <StatCard
          icon={<HardHat size={20} />}
          label="Chantiers"
          value={stats.projectsActive.toString()}
          href="/chantiers"
          subtitle={`${stats.projectsActive} actifs · ${stats.projectsDone} terminés`}
        />
        <StatCard
          icon={<Wallet size={20} />}
          label="Encaissements"
          value={formatFC(stats.paymentsFc)}
          href="/paiements"
          subtitle={`≈ ${formatUSD(stats.paymentsFc / exchangeRate)}`}
          highlight
        />
      </div>

      {/* Finances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-6">
        <FinanceCard
          label="Total encaissé"
          value={formatFC(stats.paymentsFc)}
          sub={`≈ ${formatUSD(stats.paymentsFc / exchangeRate)}`}
          icon={<Wallet size={18} />}
          color="green"
        />
        <FinanceCard
          label="Total dépensé"
          value={formatFC(stats.expensesFc)}
          sub={`≈ ${formatUSD(stats.expensesFc / exchangeRate)}`}
          icon={<Receipt size={18} />}
          color="red"
        />
        <FinanceCard
          label="Marge estimée"
          value={formatFC(stats.marginFc)}
          sub={`≈ ${formatUSD(stats.marginFc / exchangeRate)}`}
          icon={<TrendingUp size={18} />}
          color={stats.marginFc >= 0 ? 'blue' : 'red'}
        />
      </div>

      {/* Deux colonnes : devis récents + chantiers récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Devis récents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue">
              Devis récents
            </h2>
            <Link
              href="/devis"
              className="text-xs text-ecm-orange hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>

          {recentQuotes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Aucun devis pour l'instant.
            </p>
          ) : (
            <div className="space-y-2">
              {recentQuotes.map((q) => (
                <Link
                  key={q.id}
                  href={`/devis/${q.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono text-ecm-blue">
                      {q.quoteNumber}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {q.client.name} — {q.projectName}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-ecm-blue">
                      {formatFC(q.totalFc)}
                    </p>
                    <div className="mt-0.5">
                      <QuoteStatusBadge status={q.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Chantiers récents */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue">
              Chantiers récents
            </h2>
            <Link
              href="/chantiers"
              className="text-xs text-ecm-orange hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Aucun chantier pour l'instant.
            </p>
          ) : (
            <div className="space-y-2">
              {recentProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/chantiers/${p.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-mono text-ecm-blue">
                      {p.projectCode}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.client.name} — {p.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-ecm-blue">
                      {formatFC(p.totalAmount)}
                    </p>
                    <div className="mt-0.5">
                      <ProjectStatusBadge status={p.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANTS
// ============================================
function StatCard({
  icon,
  label,
  value,
  subtitle,
  href,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-ecm-orange/30 transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            highlight ? 'bg-ecm-orange/10 text-ecm-orange' : 'bg-ecm-blue/5 text-ecm-blue'
          }`}
        >
          {icon}
        </div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <p
        className={`font-bold truncate ${
          highlight ? 'text-ecm-orange text-lg' : 'text-ecm-blue text-2xl'
        }`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>
      )}
    </Link>
  );
}

function FinanceCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'blue';
}) {
  const colorClass = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-ecm-blue/5 text-ecm-blue',
  }[color];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}
        >
          {icon}
        </div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
      <p className="text-lg sm:text-xl font-bold text-ecm-blue truncate">
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
    </div>
  );
}