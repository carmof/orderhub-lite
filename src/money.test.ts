import { describe, expect, it } from 'vitest';
import Money from './money.js';

describe('Money', () => {
  it.for<[string, number]>([
    ['10,50', 1050],
    ['10.50', 1050],
    ['10', 1000],
    ['10,5', 1050],
    ['10.5', 1050],
    ['-10.5', -1050],
  ])('toCents should convert valid string to cents (%s => %i)', ([input, expected]) => {
    expect(Money.toCents(input)).toBe(expected);
  });

  it.for<string>(['10,500', '10.500', '10,505', '10.505'])(
    'toCents should throw for invalid string (%s)',
    (input) => {
      expect(() => Money.toCents(input)).toThrow('Invalid value format');
    },
  );

  it.for<[number, string]>([
    [1050, 'R$ 10,50'],
    [1000, 'R$ 10,00'],
    [123456, 'R$ 1.234,56'],
  ])('formatBRL should format cents to BRL string (%i => %s)', ([input, expected]) => {
    expect(Money.formatBRL(input)).toBe(expected);
  });
});
