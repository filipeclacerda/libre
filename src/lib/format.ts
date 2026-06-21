const SYMBOL_FALLBACK: Record<string, string> = { BRL: 'R$', USD: '$', EUR: '€', GBP: '£' };

export { SYMBOL_FALLBACK };

export function formatCurrency(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const symbol = SYMBOL_FALLBACK[currency] ?? currency;
    const grouped = Math.round(amount).toLocaleString('en-US'); // safe grouping fallback
    return `${symbol} ${grouped}`;
  }
}

/** Maps an app language code to a sensible Intl locale tag for number/date formatting. */
export function localeFor(lang: string): string {
  return lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'pt-BR';
}
