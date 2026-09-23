import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  HardHat,
  User,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import { getProject } from '../actions';
import { formatDate, formatFC, formatUSD } from '@/lib/format';
import { getAllSettings } from '@/lib/settings';
import ProjectStatusBadge from '../ProjectStatusBadge';
import ProjectStatusChanger from './ProjectStatusChanger';
import PaymentsSection from './PaymentsSection';
import ExpensesSection from './ExpensesSection';

export const dynamic = 'force-dynamic';

export default async function ChantierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, settings] = await Promise.all([
    getProject(id),
    getAllSettings(),
  ]);

  if (!project) notFound();

  const exchangeRate = parseFloat(settings.exchange_rate);

  // Calculs financiers
  const totalFc = project.totalAmount;
  const totalUsd = totalFc / exchangeRate;

  const paymentsFc = project.payments.reduce((sum, p) => {
    return sum + (p.currency === 'FC' ? p.amount : p.amount * exchangeRate);
  }, 0);
  const paymentsUsd = project.payments.reduce((sum, p) => {
    return sum + (p.currency === 'USD' ? p.amount : p.amount / exchangeRate);
  }, 0);

  const expensesFc = project.expenses.reduce((sum, e) => {
    return sum + (e.currency === 'FC' ? e.amount : e.amount * exchangeRate);
  }, 0);
  const expensesUsd = project.expenses.reduce((sum, e) => {
    return sum + (e.currency === 'USD' ? e.amount : e.amount / exchangeRate);
  }, 0);

  const remainingFc = totalFc - paymentsFc;
  const marginFc = paymentsFc - expensesFc;
  const marginPercent = paymentsFc > 0 ? (marginFc / paymentsFc) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <Link
          href="/chantiers"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ecm-blue transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Retour aux chantiers
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-500 mb-1">
              {project.projectCode}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
              <HardHat size={28} />
              <span className="truncate">{project.name}</span>
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              {project.quote && (
                <Link
                  href={`/devis/${project.quote.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-ecm-blue bg-ecm-blue/5 hover:bg-ecm-blue/10 px-2.5 py-1 rounded-full transition-colors"
                >
                  <FileText size={12} />
                  {project.quote.quoteNumber}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne gauche (2/3) : infos + paiements + dépenses */}
        <div className="lg:col-span-2 space-y-5">
          {/* Infos générales */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue mb-4">
              Informations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <InfoRow
                icon={<User size={14} />}
                label="Client"
                value={project.client.name}
              />
              <InfoRow
                icon={<Calendar size={14} />}
                label="Créé le"
                value={formatDate(project.createdAt)}
              />
              {project.quote?.siteLocation && (
                <InfoRow
                  icon={<MapPin size={14} />}
                  label="Lieu"
                  value={project.quote.siteLocation}
                />
              )}
              <InfoRow
                icon={<Calendar size={14} />}
                label="Taux appliqué"
                value={`1 USD = ${exchangeRate} FC`}
              />
            </div>
          </div>

          {/* Paiements */}
          <PaymentsSection
            projectId={project.id}
            payments={project.payments.map((p) => ({
              id: p.id,
              amount: p.amount,
              currency: p.currency,
              method: p.method,
              reference: p.reference,
              notes: p.notes,
              paymentDate: p.paymentDate.toISOString(),
            }))}
            exchangeRate={exchangeRate}
          />

          {/* Dépenses */}
          <ExpensesSection
            projectId={project.id}
            expenses={project.expenses.map((e) => ({
              id: e.id,
              category: e.category,
              description: e.description,
              amount: e.amount,
              currency: e.currency,
              notes: e.notes,
              date: e.date.toISOString(),
            }))}
            exchangeRate={exchangeRate}
          />
        </div>

        {/* Colonne droite (1/3) : récap financier + changement de statut */}
        <div className="space-y-5">
          {/* Récap financier */}
          <div className="bg-ecm-blue text-white rounded-xl shadow-sm p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-4">
              Récapitulatif financier
            </h2>

            <div className="space-y-3 text-sm">
              <FinRow
                label="Montant devis"
                value={formatFC(totalFc)}
                sub={`≈ ${formatUSD(totalUsd)}`}
              />
              <FinRow
                label="Encaissé"
                value={formatFC(paymentsFc)}
                sub={`≈ ${formatUSD(paymentsUsd)}`}
                color="text-green-300"
              />
              <FinRow
                label="Dépensé"
                value={formatFC(expensesFc)}
                sub={`≈ ${formatUSD(expensesUsd)}`}
                color="text-red-300"
              />
            </div>

            <div className="pt-4 mt-4 border-t border-white/20 space-y-3">
              <FinRow
                label="Reste à payer"
                value={formatFC(remainingFc)}
                sub={remainingFc <= 0 ? 'Payé' : ''}
                highlight={remainingFc > 0 ? 'orange' : 'green'}
              />
              <FinRow
                label="Marge estimée"
                value={formatFC(marginFc)}
                sub={`${marginPercent >= 0 ? '+' : ''}${marginPercent.toFixed(1)} %`}
                highlight={marginFc >= 0 ? 'green' : 'red'}
              />
            </div>
          </div>

          {/* Changement de statut */}
          <ProjectStatusChanger
            projectId={project.id}
            currentStatus={project.status}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-ecm-text truncate">{value}</p>
      </div>
    </div>
  );
}

function FinRow({
  label,
  value,
  sub,
  color,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  highlight?: 'orange' | 'green' | 'red';
}) {
  const highlightClass =
    highlight === 'orange'
      ? 'text-ecm-orange'
      : highlight === 'green'
        ? 'text-green-400'
        : highlight === 'red'
          ? 'text-red-400'
          : 'text-white';

  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-white/70">{label}</span>
      <div className="text-right">
        <p
          className={`font-semibold ${color ?? highlightClass}`}
        >
          {value}
        </p>
        {sub && <p className="text-xs text-white/50">{sub}</p>}
      </div>
    </div>
  );
}