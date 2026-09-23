'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateQuoteNumber } from '@/lib/codes';
import { getSetting } from '@/lib/settings';

// ============================================
// SCHÉMA
// ============================================
const quoteItemSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  unit: z.string().default('pièce'),
  quantity: z.coerce.number().positive('Quantité > 0'),
  unitPrice: z.coerce.number().min(0, 'Prix >= 0'),
});

const quoteSchema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  projectName: z.string().min(1, 'Projet requis'),
  siteLocation: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  exchangeRate: z.coerce.number().positive(),
  laborCostUsd: z.coerce.number().min(0).default(0),
  transportUsd: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  items: z.array(quoteItemSchema).min(1, 'Au moins un article requis'),
});

// ============================================
// CRÉATION D'UN DEVIS
// ============================================
export async function createQuote(formData: FormData) {
  try {
    const rawData = JSON.parse(formData.get('data') as string);

    const parsed = quoteSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const data = parsed.data;

    // Calculs
    const itemsTotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const subtotal = itemsTotal;
    const totalFc = subtotal - data.discount;
    const totalUsd =
      totalFc / data.exchangeRate + data.laborCostUsd + data.transportUsd;

    // Numérotation
    const prefix = await getSetting('quote_prefix');
    const quoteNumber = await generateQuoteNumber(prefix || 'DEV');

    // Validité
    const validityDays = parseInt(await getSetting('quote_validity_days'), 10) || 15;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    // Création
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        projectName: data.projectName,
        siteLocation: data.siteLocation || null,
        notes: data.notes || null,
        exchangeRate: data.exchangeRate,
        discount: data.discount,
        laborCostUsd: data.laborCostUsd,
        transportUsd: data.transportUsd,
        subtotalFc: subtotal,
        totalFc,
        totalUsd,
        validUntil,
        status: 'BROUILLON',
        clientId: data.clientId,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            unit: item.unit,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
    });

    revalidatePath('/devis');
    revalidatePath('/');
    // ❌ PAS de redirect() ici — c'est le client qui redirige
    return { success: true, id: quote.id };
  } catch (e: any) {
    return { error: e.message || 'Erreur inattendue' };
  }
}

// ============================================
// LECTURE
// ============================================
export async function getQuotes() {
  return prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true, code: true } },
      _count: { select: { items: true } },
    },
  });
}

export async function getQuote(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      client: true,
      items: true,
      project: true,
    },
  });
}

// ============================================
// CHANGEMENT DE STATUT
// ============================================
export async function updateQuoteStatus(id: string, status: string) {
  await prisma.quote.update({
    where: { id },
    data: { status },
  });
  revalidatePath('/devis');
  revalidatePath(`/devis/${id}`);
  return { success: true };
}

// ============================================
// CRÉATION RAPIDE D'UN CLIENT (depuis le devis)
// ============================================
export async function createQuickClient(data: {
  name: string;
  phone: string;
}) {
  if (!data.name?.trim()) return { error: 'Le nom est obligatoire' };
  if (!data.phone?.trim()) return { error: 'Le téléphone est obligatoire' };

  const { generateClientCode } = await import('@/lib/codes');
  const code = await generateClientCode();

  const client = await prisma.client.create({
    data: {
      code,
      name: data.name.trim(),
      phone: data.phone.trim(),
      type: 'Particulier',
    },
  });

  revalidatePath('/clients');
  return { success: true, client: { id: client.id, name: client.name, code: client.code } };
}


// ============================================
// MODIFIER UN DEVIS
// ============================================
export async function updateQuote(
  id: string,
  formData: FormData
) {
  try {
    const rawData = JSON.parse(formData.get('data') as string);

    const parsed = quoteSchema.safeParse(rawData);
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }

    const data = parsed.data;

    // Recalculs
    const itemsTotal = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const subtotal = itemsTotal;
    const totalFc = subtotal - data.discount;
    const totalUsd =
      totalFc / data.exchangeRate + data.laborCostUsd + data.transportUsd;

    // Mise à jour : on supprime les anciennes lignes et on recrée
    await prisma.$transaction([
      prisma.quoteItem.deleteMany({ where: { quoteId: id } }),
      prisma.quote.update({
        where: { id },
        data: {
          projectName: data.projectName,
          siteLocation: data.siteLocation || null,
          notes: data.notes || null,
          exchangeRate: data.exchangeRate,
          discount: data.discount,
          laborCostUsd: data.laborCostUsd,
          transportUsd: data.transportUsd,
          subtotalFc: subtotal,
          totalFc,
          totalUsd,
          clientId: data.clientId,
          items: {
            create: data.items.map((item) => ({
              description: item.description,
              unit: item.unit,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
      }),
    ]);

    revalidatePath('/devis');
    revalidatePath(`/devis/${id}`);
    revalidatePath('/');
    return { success: true, id };
  } catch (e: any) {
    return { error: e.message || 'Erreur inattendue' };
  }
}

// ============================================
// SUPPRIMER UN DEVIS
// ============================================
export async function deleteQuote(id: string) {
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      project: true,
    },
  });

  if (!quote) return { error: 'Devis introuvable' };

  if (quote.project) {
    return {
      error: `Impossible de supprimer : ce devis est lié au chantier ${quote.project.projectCode}.`,
    };
  }

  await prisma.quote.delete({ where: { id } });
  revalidatePath('/devis');
  revalidatePath('/');
  return { success: true };
}

// ============================================
// CONVERTIR UN DEVIS EN CHANTIER
// ============================================
export async function convertQuoteToProject(quoteId: string) {
  // Récupérer le devis
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      client: true,
      project: true,
    },
  });

  if (!quote) {
    return { error: 'Devis introuvable' };
  }

  if (quote.project) {
    return {
      error: `Ce devis a déjà été converti en chantier ${quote.project.projectCode}`,
      projectId: quote.project.id,
    };
  }

  // Vérifier que le devis est accepté
  if (quote.status !== 'ACCEPTE') {
    return {
      error: "Le devis doit être marqué comme ACCEPTÉ avant la conversion.",
    };
  }

  // Générer le code chantier
  const { generateProjectCode } = await import('@/lib/codes');
  const projectCode = await generateProjectCode();

  // Créer le chantier
  const project = await prisma.project.create({
    data: {
      projectCode,
      name: quote.projectName,
      status: 'PREPARATION',
      totalAmount: quote.totalFc,
      clientId: quote.clientId,
      quoteId: quote.id,
    },
  });

  revalidatePath('/chantiers');
  revalidatePath('/devis');
  revalidatePath(`/devis/${quoteId}`);

  return { success: true, projectId: project.id, projectCode };
}