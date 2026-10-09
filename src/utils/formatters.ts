/**
 * Utility formatters for Spanish currency, percentage, and dates
 */

export function formatEUR(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, minDecimals: number = 2, maxDecimals: number = 2): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

export function formatPercent(value: number, includeSign: boolean = true): string {
  const formatted = formatNumber(Math.abs(value), 1, 2);
  if (value > 0 && includeSign) {
    return `+${formatted}%`;
  }
  if (value < 0 && includeSign) {
    return `-${formatted}%`;
  }
  return `${formatted}%`;
}

export function formatCurrencyVal(value: number, currency: string = 'EUR'): string {
  return `${formatNumber(value, 2, 2)} ${currency}`;
}

/**
 * Downloads data as a CSV file compatible with Excel in Spanish (; separator, UTF-8 BOM)
 */
export function downloadCSV(filename: string, rows: (string | number)[][], headers: string[]) {
  const BOM = '\uFEFF';
  const csvContent = [
    headers.map(h => `"${h}"`).join(';'),
    ...rows.map(row =>
      row
        .map(cell => {
          if (typeof cell === 'number') {
            return `"${formatNumber(cell)}"`;
          }
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(';')
    ),
  ].join('\r\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
