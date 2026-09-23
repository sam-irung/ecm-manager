export function formatFC(amount: number): string {
  return new Intl.NumberFormat('fr-CD', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(amount) + ' FC';
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format sans symbole (utile dans les tableaux PDF)
 */
export function formatFCNumber(amount: number): string {
  return new Intl.NumberFormat('fr-CD', {
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatUSDNumber(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format avec jour + mois en lettres
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}