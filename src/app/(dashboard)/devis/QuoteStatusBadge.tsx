const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  BROUILLON: {
    label: 'Brouillon',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  },
  ENVOYE: {
    label: 'Envoyé',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
  },
  ACCEPTE: {
    label: 'Accepté',
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  REFUSE: {
    label: 'Refusé',
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
  EXPIRE: {
    label: 'Expiré',
    bg: 'bg-orange-100',
    text: 'text-orange-700',
  },
};

export default function QuoteStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.BROUILLON;

  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${config.bg} ${config.text} whitespace-nowrap`}
    >
      {config.label}
    </span>
  );
}