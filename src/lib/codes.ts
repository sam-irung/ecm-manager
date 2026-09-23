import { prisma } from './prisma';

/**
 * Incrémente un compteur et retourne sa nouvelle valeur
 */
async function incrementCounter(key: string): Promise<number> {
  const counter = await prisma.counter.upsert({
    where: { key },
    update: { value: { increment: 1 } },
    create: { key, value: 1 },
  });
  return counter.value;
}

/**
 * Génère un code client : CLIENT-0001
 */
export async function generateClientCode(): Promise<string> {
  const lastClient = await prisma.client.findFirst({
    orderBy: { code: 'desc' },
    select: { code: true },
  });

  if (!lastClient) return 'CLIENT-0001';

  const lastNumber = parseInt(lastClient.code.replace('CLIENT-', ''), 10);
  const nextNumber = lastNumber + 1;
  return `CLIENT-${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Génère un numéro de devis : DEV-2026-001
 */
export async function generateQuoteNumber(
  prefix: string = 'DEV'
): Promise<string> {
  const year = new Date().getFullYear();
  const key = `quote-${year}`;
  const value = await incrementCounter(key);
  return `${prefix}-${year}-${value.toString().padStart(3, '0')}`;
}

/**
 * Génère un code chantier : TRAV-2026-001
 */
export async function generateProjectCode(): Promise<string> {
  const year = new Date().getFullYear();
  const key = `project-${year}`;
  const value = await incrementCounter(key);
  return `TRAV-${year}-${value.toString().padStart(3, '0')}`;
}