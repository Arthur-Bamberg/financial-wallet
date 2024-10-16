export const formatCurrency = (value: unknown): string => {
  if (typeof value !== 'number') return '-';

  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatPercentage = (value: unknown): string => {
  if (typeof value !== 'number') return '-';
  
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
};