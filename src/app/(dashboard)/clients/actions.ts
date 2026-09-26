'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateClientCode } from '@/lib/codes';

const clientSchema = z.object({
  name: z.string().min(2, 'Le nom est obligatoire'),
  phone: z.string().min(6, 'Le téléphone est obligatoire'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
  type: z.enum(['Particulier', 'Entreprise', 'Commerce', 'Autre']),
  notes: z.string().optional(),
});

export async function createClient(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || '',
    address: (formData.get('address') as string) || '',
    type: (formData.get('type') as string) || 'Particulier',
    notes: (formData.get('notes') as string) || '',
  };

  const parsed = clientSchema.safeParse(rawData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const code = await generateClientCode();

  await prisma.client.create({
    data: {
      code,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      type: parsed.data.type,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath('/clients');
  redirect('/clients');
}

export async function getClient(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      quotes: { orderBy: { createdAt: 'desc' } },
      projects: { orderBy: { createdAt: 'desc' } },
    },
  });
}

// ============================================
// MODIFIER UN CLIENT
// ============================================
export async function updateClient(id: string, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || '',
    address: (formData.get('address') as string) || '',
    type: (formData.get('type') as string) || 'Particulier',
    notes: (formData.get('notes') as string) || '',
  };

  const parsed = clientSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.client.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      type: parsed.data.type,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
  return { success: true };
}

// ============================================
// ARCHIVER UN CLIENT
// ============================================
export async function archiveClient(id: string) {
  await prisma.client.update({
    where: { id },
    data: { archived: true },
  });
  revalidatePath('/clients');
  return { success: true };
}

// ============================================
// RESTAURER UN CLIENT
// ============================================
export async function restoreClient(id: string) {
  await prisma.client.update({
    where: { id },
    data: { archived: false },
  });
  revalidatePath('/clients');
  return { success: true };
}

// ============================================
// SUPPRIMER DÉFINITIVEMENT UN CLIENT
// ============================================
export async function deleteClient(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      _count: { select: { quotes: true, projects: true } },
    },
  });

  if (!client) return { error: 'Client introuvable' };

  if (client._count.quotes > 0 || client._count.projects > 0) {
    return {
      error: `Impossible de supprimer : ce client a ${client._count.quotes} devis et ${client._count.projects} chantier(s) associé(s). Archivez-le à la place.`,
    };
  }

  await prisma.client.delete({ where: { id } });
  revalidatePath('/clients');
  return { success: true };
}

// ============================================
// LECTURE AVEC FILTRE ARCHIVE
// ============================================
export async function getClients(includeArchived = false) {
  return prisma.client.findMany({
    where: includeArchived ? {} : { archived: false },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { quotes: true, projects: true },
      },
    },
  });
}

export async function getArchivedClientsCount() {
  return prisma.client.count({ where: { archived: true } });
}