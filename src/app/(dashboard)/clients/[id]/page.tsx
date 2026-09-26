import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  FileText,
  HardHat,
  Calendar,
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatDate, formatFC } from '@/lib/format';
import ClientActions from './ClientActions';
import EditClientModal from './EditClientModal';

export const dynamic = 'force-dynamic';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      quotes: { orderBy: { createdAt: 'desc' } },
      projects: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!client) notFound();

  const totalQuoted = client.quotes.reduce((sum, q) => sum + q.totalFc, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ecm-blue transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Retour aux clients
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-gray-500 mb-1">
              {client.code}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue">
              {client.name}
            </h1>
            <span className="inline-block mt-2 text-xs bg-ecm-blue/10 text-ecm-blue font-medium px-2.5 py-1 rounded-full">
              {client.type}
            </span>
          </div>

            <ClientActions
            client={{
                id: client.id,
                name: client.name,
                archived: client.archived,
                quotesCount: client.quotes.length,
                projectsCount: client.projects.length,
            }}
            />
        </div>
      </div>

      {/* Coordonnées */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue mb-4">
          Coordonnées
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <InfoLine icon={<Phone size={16} />} label="Téléphone" value={client.phone} />
          <InfoLine icon={<Mail size={16} />} label="Email" value={client.email || '—'} />
          <InfoLine
            icon={<MapPin size={16} />}
            label="Adresse"
            value={client.address || '—'}
          />
          <InfoLine
            icon={<Calendar size={16} />}
            label="Client depuis"
            value={formatDate(client.createdAt)}
          />
        </div>
        {client.notes && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Notes internes</p>
            <p className="text-sm text-ecm-text whitespace-pre-wrap">
              {client.notes}
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <StatCard
          icon={<FileText size={20} className="text-ecm-orange" />}
          label="Devis"
          value={client.quotes.length}
        />
        <StatCard
          icon={<HardHat size={20} className="text-ecm-orange" />}
          label="Chantiers"
          value={client.projects.length}
        />
        <StatCard
          icon={<span className="text-ecm-orange font-bold">FC</span>}
          label="Total devisé"
          value={formatFC(totalQuoted)}
          small
        />
      </div>

      {/* Devis récents */}
      {client.quotes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue mb-4">
            Devis récents
          </h2>
          <div className="space-y-2">
            {client.quotes.slice(0, 5).map((q) => (
              <Link
                key={q.id}
                href={`/devis/${q.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono text-ecm-blue">
                    {q.quoteNumber}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {q.projectName}
                  </p>
                </div>
                <span className="text-sm font-medium text-ecm-blue ml-3">
                  {formatFC(q.totalFc)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Chantiers */}
      {client.projects.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ecm-blue mb-4">
            Chantiers
          </h2>
          <div className="space-y-2">
            {client.projects.map((p) => (
              <Link
                key={p.id}
                href={`/chantiers/${p.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono text-ecm-blue">
                    {p.projectCode}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{p.name}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                  {p.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <EditClientModal
        client={{
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email || '',
          address: client.address || '',
          type: client.type,
          notes: client.notes || '',
        }}
      />
    </div>
  );
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-ecm-text truncate">{value}</p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  small?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p
        className={`font-bold text-ecm-blue ${
          small ? 'text-lg' : 'text-2xl'
        }`}
      >
        {value}
      </p>
    </div>
  );
}