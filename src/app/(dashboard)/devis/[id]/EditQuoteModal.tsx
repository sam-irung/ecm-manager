'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useQuoteModalStore } from '@/lib/quoteModalStore';
import { updateQuote } from '../actions';
import { formatFC, formatUSD } from '@/lib/format';

interface Client {
  id: string;
  name: string;
  code: string;
}

interface Product {
  id: string;
  name: string;
  unit: string;
  priceFc: number;
}

interface Category {
  id: string;
  name: string;
  products: Product[];
}

interface QuoteItem {
  id: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  quote: {
    id: string;
    clientId: string;
    projectName: string;
    siteLocation: string | null;
    notes: string | null;
    exchangeRate: number;
    discount: number;
    laborCostUsd: number;
    transportUsd: number;
    items: QuoteItem[];
  };
  clients: Client[];
  categories: Category[];
  defaultUnit: string;
}

const inputClass =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ecm-orange focus:border-transparent transition-all';

const textareaClass = inputClass + ' resize-none';

interface EditableLine {
  id: string;
  productId: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export default function EditQuoteModal({
  quote,
  clients,
  categories,
  defaultUnit,
}: Props) {
  const router = useRouter();
  const { isOpen, close } = useQuoteModalStore();

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);

  // Infos générales
  const [clientId, setClientId] = useState(quote.clientId);
  const [projectName, setProjectName] = useState(quote.projectName);
  const [siteLocation, setSiteLocation] = useState(quote.siteLocation ?? '');
  const [notes, setNotes] = useState(quote.notes ?? '');

  // Finances
  const [exchangeRate, setExchangeRate] = useState(quote.exchangeRate);
  const [laborCostUsd, setLaborCostUsd] = useState(quote.laborCostUsd);
  const [transportUsd, setTransportUsd] = useState(quote.transportUsd);
  const [discount, setDiscount] = useState(quote.discount);

  // Lignes
  const [lines, setLines] = useState<EditableLine[]>(
    quote.items.map((item) => ({
      id: item.id,
      productId: null,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }))
  );

  // Reset à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setClientId(quote.clientId);
      setProjectName(quote.projectName);
      setSiteLocation(quote.siteLocation ?? '');
      setNotes(quote.notes ?? '');
      setExchangeRate(quote.exchangeRate);
      setLaborCostUsd(quote.laborCostUsd);
      setTransportUsd(quote.transportUsd);
      setDiscount(quote.discount);
      setLines(
        quote.items.map((item) => ({
          id: item.id,
          productId: null,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      );
      setStatus('idle');
      setError(null);
    }
  }, [isOpen, quote]);

  // Calculs
  const totals = useMemo(() => {
    const itemsTotal = lines.reduce(
      (sum, l) => sum + l.quantity * l.unitPrice,
      0
    );
    const subtotal = itemsTotal;
    const totalFc = subtotal - discount;
    const totalUsd =
      totalFc / exchangeRate + laborCostUsd + transportUsd;
    return { subtotal, totalFc, totalUsd };
  }, [lines, discount, exchangeRate, laborCostUsd, transportUsd]);

  // Gestion des lignes
  function addLine() {
    setLines([
      ...lines,
      {
        id: crypto.randomUUID(),
        productId: null,
        description: '',
        unit: defaultUnit,
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }

  function removeLine(id: string) {
    if (lines.length === 1) return;
    setLines(lines.filter((l) => l.id !== id));
  }

  function updateLine(id: string, updates: Partial<EditableLine>) {
    setLines(lines.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  }

  function selectProduct(lineId: string, productId: string) {
    if (!productId) {
      updateLine(lineId, { productId: null });
      return;
    }
    let product: Product | undefined;
    for (const cat of categories) {
      product = cat.products.find((p) => p.id === productId);
      if (product) break;
    }
    if (product) {
      updateLine(lineId, {
        productId: product.id,
        description: product.name,
        unit: product.unit,
        unitPrice: product.priceFc,
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError('Veuillez sélectionner un client');
      return;
    }
    if (!projectName.trim()) {
      setError('Veuillez saisir le nom du projet');
      return;
    }

    const validLines = lines.filter(
      (l) => l.description.trim() && l.quantity > 0
    );
    if (validLines.length === 0) {
      setError('Ajoutez au moins une ligne valide');
      return;
    }

    setStatus('saving');

    const formData = new FormData();
    formData.append(
      'data',
      JSON.stringify({
        clientId,
        projectName,
        siteLocation,
        notes,
        exchangeRate,
        laborCostUsd,
        transportUsd,
        discount,
        items: validLines.map((l) => ({
          description: l.description,
          unit: l.unit,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      })
    );

    const result = await updateQuote(quote.id, formData);

    if (result?.error) {
      setError(result.error);
      setStatus('error');
      return;
    }

    setStatus('success');
    setTimeout(() => {
      close();
      router.refresh();
    }, 800);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full my-8">
        {/* En-tête */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="text-lg font-semibold text-ecm-blue">
            Modifier le devis
          </h3>
          <button
            onClick={close}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {status === 'error' && error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle2 size={18} />
              Devis mis à jour avec succès.
            </div>
          )}

          {/* Infos générales */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ecm-blue">
              Informations générales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Sélectionner un client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nom du projet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Lieu du chantier
                </label>
                <input
                  type="text"
                  value={siteLocation}
                  onChange={(e) => setSiteLocation(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Taux de change (1 USD = ? FC)
                </label>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) =>
                    setExchangeRate(parseFloat(e.target.value) || 0)
                  }
                  min="1"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Notes internes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Lignes */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ecm-blue">
              Articles / Prestations
            </h4>

            {lines.map((line) => (
              <div
                key={line.id}
                className="bg-white border border-gray-200 rounded-lg p-3 space-y-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={line.description}
                    onChange={(e) =>
                      updateLine(line.id, { description: e.target.value })
                    }
                    placeholder="Description..."
                    className="md:col-span-5 px-3 py-2 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none"
                  />
                  <input
                    type="text"
                    value={line.unit}
                    onChange={(e) =>
                      updateLine(line.id, { unit: e.target.value })
                    }
                    placeholder="Unité"
                    className="md:col-span-2 px-3 py-2 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none"
                  />
                  <input
                    type="number"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.id, {
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.01"
                    placeholder="Qté"
                    className="md:col-span-1 px-3 py-2 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none"
                  />
                  <input
                    type="number"
                    value={line.unitPrice}
                    onChange={(e) =>
                      updateLine(line.id, {
                        unitPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    placeholder="Prix"
                    className="md:col-span-2 px-3 py-2 text-sm border border-gray-200 rounded focus:border-ecm-orange focus:outline-none text-right"
                  />
                  <div className="md:col-span-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ecm-blue">
                      {formatFC(line.quantity * line.unitPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <select
                  value={line.productId ?? ''}
                  onChange={(e) => selectProduct(line.id, e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded bg-white focus:border-ecm-orange focus:outline-none"
                >
                  <option value="">— Choisir depuis le catalogue —</option>
                  {categories.map((cat) => (
                    <optgroup key={cat.id} label={cat.name}>
                      {cat.products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatFC(p.priceFc)})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            ))}

            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-2 text-sm font-medium text-ecm-orange hover:text-orange-700 transition-colors"
            >
              <Plus size={16} />
              Ajouter une ligne
            </button>
          </div>

          {/* Finances */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ecm-blue">
              Main-d'œuvre et frais
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Main-d'œuvre (USD)
                </label>
                <input
                  type="number"
                  value={laborCostUsd}
                  onChange={(e) =>
                    setLaborCostUsd(parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.01"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Transport (USD)
                </label>
                <input
                  type="number"
                  value={transportUsd}
                  onChange={(e) =>
                    setTransportUsd(parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.01"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Remise (FC)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="bg-ecm-blue text-white rounded-lg p-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-white/70">Sous-total</span>
                <span>{formatFC(totals.subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/70">Remise</span>
                  <span>- {formatFC(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t border-white/20">
                <span>Total FC</span>
                <span>{formatFC(totals.totalFc)}</span>
              </div>
              <div className="flex justify-between font-bold text-ecm-orange">
                <span>Total USD</span>
                <span>{formatUSD(totals.totalUsd)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={status === 'saving'}
              className="flex items-center gap-2 px-5 py-2.5 bg-ecm-orange hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Save size={16} />
              {status === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}