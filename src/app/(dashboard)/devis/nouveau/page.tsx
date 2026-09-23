import { getAllSettings } from '@/lib/settings';
import { prisma } from '@/lib/prisma';
import DevisForm from './DevisForm';

export const dynamic = 'force-dynamic';

export default async function NouveauDevisPage() {
  const [settings, clients, categories] = await Promise.all([
    getAllSettings(),
    prisma.client.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true },
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        products: {
          where: { active: true },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            unit: true,
            priceFc: true,
          },
        },
      },
    }),
  ]);

  return (
    <DevisForm
      clients={clients}
      categories={categories}
      defaultExchangeRate={parseFloat(settings.exchange_rate)}
      defaultUnit={settings.default_unit}
    />
  );
}