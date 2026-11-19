import { type OrderItem } from '@orderhub/contracts';

export const orderTotalCents = (items: OrderItem[]): number => {
  const totalCents = items.reduce((acc, item) => acc + item.quantity * item.unitPriceCents, 0);
  if (!Number.isSafeInteger(totalCents)) {
    throw new Error('Calculated TotalCents is not a Safe Integer.');
  }
  return totalCents;
};
