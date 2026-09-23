import Link from 'next/link';
import { Plus, HardHat } from 'lucide-react';
import { getProjects } from './actions';
import { formatDate, formatFC } from '@/lib/format';
import ProjectStatusBadge from './ProjectStatusBadge';

export const dynamic = 'force-dynamic';

export default async function ChantiersPage() {
  const projects = await getProjects();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
            <HardHat size={28} />
            Chantiers
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {projects.length} chantier{projects.length > 1 ? 's' : ''}{' '}
            enregistré{projects.length > 1 ? 's' : ''}
          </p>
        </div>

        <Link
          href="/devis"
          className="flex items-center justify-center gap-2 bg-ecm-orange hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus size={20} />
          Depuis un devis
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Tableau desktop */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nom / Client
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Devis
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Paiements
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dépenses
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/chantiers/${project.id}`}
                        className="text-sm font-mono font-semibold text-ecm-blue hover:text-ecm-orange transition-colors"
                      >
                        {project.projectCode}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-ecm-blue truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {project.client.name}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-gray-500">
                      {project.quote?.quoteNumber ?? '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-ecm-blue text-right">
                      {formatFC(project.totalAmount)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 text-center">
                      {project._count.payments}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 text-center">
                      {project._count.expenses}
                    </td>
                    <td className="px-5 py-4">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cartes mobile */}
          <div className="lg:hidden space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/chantiers/${project.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-ecm-orange/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-ecm-blue">
                      {project.projectCode}
                    </p>
                    <p className="text-sm font-semibold text-ecm-blue truncate mt-1">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {project.client.name}
                    </p>
                  </div>
                  <ProjectStatusBadge status={project.status} />
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    <span>{project._count.payments} paiement(s)</span>
                    <span className="mx-1">·</span>
                    <span>{project._count.expenses} dépense(s)</span>
                  </div>
                  <p className="text-sm font-bold text-ecm-blue">
                    {formatFC(project.totalAmount)}
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

function EmptyState() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-ecm-orange/10 mb-4">
        <HardHat size={28} className="text-ecm-orange" />
      </div>
      <h3 className="text-lg font-semibold text-ecm-blue mb-2">
        Aucun chantier pour l'instant
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
        Les chantiers sont créés à partir de devis acceptés. Va sur un devis,
        marque-le comme accepté, puis convertis-le en chantier.
      </p>
      <Link
        href="/devis"
        className="inline-flex items-center gap-2 bg-ecm-orange hover:bg-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        <Plus size={20} />
        Voir les devis
      </Link>
    </div>
  );
}