'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ============================================
// LECTURE
// ============================================
export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true, code: true } },
      quote: { select: { quoteNumber: true, totalFc: true } },
      _count: { select: { payments: true, expenses: true } },
    },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      quote: {
        include: {
          items: { orderBy: { id: 'asc' } },
        },
      },
      payments: { orderBy: { paymentDate: 'desc' } },
      expenses: { orderBy: { date: 'desc' } },
    },
  });
}

// ============================================
// STATUT
// ============================================
const statusSchema = z.enum([
  'PREPARATION',
  'EN_COURS',
  'EN_PAUSE',
  'TERMINE',
  'ANNULE',
]);

export async function updateProjectStatus(id: string, status: string) {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) {
    return { error: 'Statut invalide' };
  }

  await prisma.project.update({
    where: { id },
    data: { status: parsed.data },
  });

  revalidatePath('/chantiers');
  revalidatePath(`/chantiers/${id}`);
  return { success: true };
}

// ============================================
// PAIEMENTS
// ============================================
const paymentSchema = z.object({
  amount: z.coerce.number().positive('Le montant doit être positif'),
  currency: z.enum(['FC', 'USD']),
  method: z.string().min(1, 'Mode de paiement requis'),
  reference: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export async function addPayment(projectId: string, formData: FormData) {
  const rawData = {
    amount: formData.get('amount'),
    currency: formData.get('currency'),
    method: formData.get('method'),
    reference: (formData.get('reference') as string) || '',
    notes: (formData.get('notes') as string) || '',
  };

  const parsed = paymentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.payment.create({
    data: {
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      method: parsed.data.method,
      reference: parsed.data.reference || null,
      notes: parsed.data.notes || null,
      projectId,
    },
  });

  revalidatePath(`/chantiers/${projectId}`);
  revalidatePath('/chantiers');
  return { success: true };
}

export async function deletePayment(id: string, projectId: string) {
  await prisma.payment.delete({ where: { id } });
  revalidatePath(`/chantiers/${projectId}`);
  return { success: true };
}

// ============================================
// DÉPENSES
// ============================================
const expenseSchema = z.object({
  category: z.string().min(1, 'Catégorie requise'),
  description: z.string().min(1, 'Description requise'),
  amount: z.coerce.number().positive('Le montant doit être positif'),
  currency: z.enum(['FC', 'USD']),
  notes: z.string().optional().default(''),
});

export async function addExpense(projectId: string, formData: FormData) {
  const rawData = {
    category: formData.get('category'),
    description: formData.get('description'),
    amount: formData.get('amount'),
    currency: formData.get('currency'),
    notes: (formData.get('notes') as string) || '',
  };

  const parsed = expenseSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.expense.create({
    data: {
      category: parsed.data.category,
      description: parsed.data.description,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      notes: parsed.data.notes || null,
      projectId,
    },
  });

  revalidatePath(`/chantiers/${projectId}`);
  revalidatePath('/chantiers');
  return { success: true };
}

export async function deleteExpense(id: string, projectId: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath(`/chantiers/${projectId}`);
  return { success: true };
}