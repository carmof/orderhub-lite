// toCents(value: string): number (aceita '10,50' e '10.50', rejeita mais de 2 casas)
export default {
  toCents: (value: string): number => {
    const regex = /^(-?)(\d+)([.,](\d{1,2}))?$/;
    const match = value.match(regex);

    if (!match) {
      throw new Error('Invalid value format');
    }
    const positiveMark = match[1];
    const integerPart = match[2];
    if (integerPart === undefined) {
      throw new Error('Invalid value format');
    }
    const decimalPart = match[4] || '00';

    return (
      (positiveMark === '-' ? -1 : 1) *
      (parseInt(integerPart) * 100 + parseInt(decimalPart.padEnd(2, '0')))
    );
  },

  formatBRL: (cents: number) => {
    const value = cents / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  },
};
