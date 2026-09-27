import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Eye, Download } from 'lucide-react';
import { getQuote } from '../actions';
//import { formatDate, formatFC, formatUSD } from '@/lib/format';
import { formatDate, formatCurrency } from '@/lib/format';
import QuoteStatusBadge from '../QuoteStatusBadge';
import { prisma } from '@/lib/prisma';
import { getSetting } from '@/lib/settings';
import QuoteActions from './QuoteActions';
import EditQuoteModal from './EditQuoteModal';
import QuoteStatusChanger from './QuoteStatusChanger';

export const dynamic = 'force-dynamic';

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [quote, clients, categories, defaultUnit] = await Promise.all([
    getQuote(id),
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
          select: { id: true, name: true, unit: true, priceFc: true },
        },
      },
    }),
    getSetting('default_unit'),
  ]);

  if (!quote) notFound();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/devis"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-ecm-blue transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Retour aux devis
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
              <FileText size={28} />
              {quote.quoteNumber}
            </h1>
            <h1 className="text-2xl sm:text-3xl font-bold text-ecm-blue flex items-center gap-3">
              <FileText size={28} />
              {quote.quoteNumber}
              <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-ecm-orange text-white">
                {quote.currency}
              </span>
            </h1>
            <p className="text-gray-600 mt-1">{quote.projectName}</p>
            <div className="mt-2">
              <QuoteStatusBadge status={quote.status} />
            </div>
          </div>

        <div className="flex flex-wrap items-center gap-2">
            <div className="mt-4">
            <QuoteStatusChanger
                quoteId={quote.id}
                status={quote.status}
                hasProject={!!quote.project}
                projectId={quote.project?.id ?? null}
                projectCode={quote.project?.projectCode ?? null}
            />
            </div>
        <a
            href={`/devis/${quote.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-ecm-orange hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
            <Eye size={16} />
            Aperçu PDF
        </a>
        <a
            href={`/devis/${quote.id}/pdf?download=1`}
            className="flex items-center gap-2 px-4 py-2.5 bg-ecm-blue hover:bg-ecm-blue/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
            <Download size={16} />
            Télécharger
        </a>
        <QuoteActions
            quote={{
            id: quote.id,
            quoteNumber: quote.quoteNumber,
            projectName: quote.projectName,
            }}
        />
        </div>

        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Client</p>
            <p className="font-medium">{quote.client.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="font-medium">{formatDate(quote.date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Lieu</p>
            <p className="font-medium">{quote.siteLocation || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Taux de change</p>
            <p className="font-medium">1 USD = {quote.exchangeRate} FC</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Articles</p>
          <div className="space-y-1 text-sm">
            {quote.items.map((item: any) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.description} × {item.quantity} {item.unit}
                </span>
                <span className="font-medium">
                  {formatCurrency(item.total, quote.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Sous-total</span>
            <span>{formatCurrency(quote.subtotalFc, quote.currency)}</span>
          </div>
          {quote.laborCostUsd > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Main-d'œuvre</span>
              <span>{formatCurrency(quote.laborCostUsd, quote.currency)}</span>
            </div>
          )}
          {quote.transportUsd > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Transport</span>
              <span>{formatCurrency(quote.transportUsd, quote.currency)}</span>
            </div>
          )}
          {quote.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Remise</span>
              <span>- {formatCurrency(quote.discount, quote.currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-ecm-blue pt-2 border-t border-gray-100">
            <span>Total {quote.currency}</span>
            <span>{formatCurrency(quote.totalFc, quote.currency)}</span>
          </div>
          <div className="flex justify-between text-ecm-orange text-xs pt-1">
            <span>
              Équivalent {quote.currency === 'FC' ? 'USD' : 'FC'}
            </span>
            <span>
              {formatCurrency(
                quote.totalUsd,
                quote.currency === 'FC' ? 'USD' : 'FC'
              )}
            </span>
          </div>
        </div>

        {quote.notes && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Notes internes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {quote.notes}
            </p>
          </div>
        )}
      </div>

      <EditQuoteModal
        quote={{
          id: quote.id,
          clientId: quote.clientId,
          projectName: quote.projectName,
          siteLocation: quote.siteLocation,
          notes: quote.notes,
          currency: quote.currency,
          exchangeRate: quote.exchangeRate,
          discount: quote.discount,
          laborCostUsd: quote.laborCostUsd,
          transportUsd: quote.transportUsd,
          items: quote.items.map((i) => ({
            id: i.id,
            description: i.description,
            unit: i.unit,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        }}
        clients={clients}
        categories={categories}
        defaultUnit={defaultUnit}
      />
    </div>
  );
}