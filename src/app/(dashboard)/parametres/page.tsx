import {
  Settings,
  Building2,
  DollarSign,
  FileText,
  Package,
  Info,
} from 'lucide-react';
import { getAllSettings } from '@/lib/settings';
import SettingsCard from '@/components/settings/SettingsCard';
import CompanyForm from './CompanyForm';
import FinancesForm from './FinancesForm';
import DevisForm from './DevisForm';
import CatalogueForm from './CatalogueForm';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ParametresPage() {
  const settings = await getAllSettings();

  // Stats pour la section Système
  const [clientsCount, quotesCount, projectsCount, productsCount] =
    await Promise.all([
      prisma.client.count(),
      prisma.quote.count(),
      prisma.project.count(),
      prisma.product.count(),
    ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
          <Settings size={28} />
          Paramètres
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Configuration générale de l'application ECM Manager
        </p>
      </div>

      <div className="space-y-4">
        {/* ENTREPRISE */}
        <SettingsCard
          icon={<Building2 size={20} className="text-ecm-blue" />}
          title="Informations de l'entreprise"
          description="Coordonnées affichées sur les devis et documents"
          defaultOpen
        >
          <CompanyForm settings={settings} />
        </SettingsCard>

        {/* FINANCES */}
        <SettingsCard
          icon={<DollarSign size={20} className="text-ecm-blue" />}
          title="Finances"
          description="Taux de change, devise et règles financières"
        >
          <FinancesForm settings={settings} />
        </SettingsCard>

        {/* DEVIS */}
        <SettingsCard
          icon={<FileText size={20} className="text-ecm-blue" />}
          title="Devis"
          description="Numérotation, validité et conditions générales"
        >
          <DevisForm settings={settings} />
        </SettingsCard>

        {/* CATALOGUE */}
        <SettingsCard
          icon={<Package size={20} className="text-ecm-blue" />}
          title="Catalogue"
          description="Paramètres par défaut pour les produits"
        >
          <CatalogueForm settings={settings} />
        </SettingsCard>

        {/* SYSTÈME */}
        <SettingsCard
          icon={<Info size={20} className="text-ecm-blue" />}
          title="Système et informations"
          description="Statistiques et détails techniques"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox label="Clients" value={clientsCount} />
            <StatBox label="Devis" value={quotesCount} />
            <StatBox label="Chantiers" value={projectsCount} />
            <StatBox label="Produits" value={productsCount} />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500 space-y-2">
            <p>
              <span className="font-semibold text-ecm-blue">
                ECM Manager
              </span>{' '}
              — Version 1.0.0
            </p>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <p className="text-2xl font-bold text-ecm-blue">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}