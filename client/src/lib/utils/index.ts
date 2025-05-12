export * from './formatCurrency';

/**
 * Formata um valor numérico para o formato de moeda em reais (R$)
 * @param value O valor a ser formatado
 * @returns String formatada no padrão de moeda brasileira
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
