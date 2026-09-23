'use server';

import { prisma } from '@/lib/prisma';
import { getExchangeRate } from '@/lib/settings';

export async function getDashboardStats() {
  const exchangeRate = await getExchangeRate();

  const [
    clientsCount,
    quotesCount,
    quotesPending,
    quotesAccepted,
    projectsActive,
    projectsDone,
    payments,
    expenses,
    recentQuotes,
    recentProjects,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.quote.count(),
    prisma.quote.count({ where: { status: { in: ['BROUILLON', 'ENVOYE'] } } }),
    prisma.quote.count({ where: { status: 'ACCEPTE' } }),
    prisma.project.count({
      where: { status: { in: ['PREPARATION', 'EN_COURS', 'EN_PAUSE'] } },
    }),
    prisma.project.count({ where: { status: 'TERMINE' } }),
    prisma.payment.findMany({
      select: { amount: true, currency: true },
    }),
    prisma.expense.findMany({
      select: { amount: true, currency: true },
    }),
    prisma.quote.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
  ]);

  // Calculs financiers (tout convertir en FC)
  const paymentsFc = payments.reduce(
    (sum, p) =>
      sum + (p.currency === 'FC' ? p.amount : p.amount * exchangeRate),
    0
  );
  const expensesFc = expenses.reduce(
    (sum, e) =>
      sum + (e.currency === 'FC' ? e.amount : e.amount * exchangeRate),
    0
  );
  const marginFc = paymentsFc - expensesFc;

  return {
    exchangeRate,
    stats: {
      clients: clientsCount,
      quotes: quotesCount,
      quotesPending,
      quotesAccepted,
      projectsActive,
      projectsDone,
      paymentsFc,
      expensesFc,
      marginFc,
    },
    recentQuotes,
    recentProjects,
  };
}