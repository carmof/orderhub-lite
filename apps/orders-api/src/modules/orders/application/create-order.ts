import type { CreateOrderInput, OrderDto } from '@orderhub/contracts';
import { placeOrder } from '../domain/order.js';
import { toOrderDto } from './order-dto.js';
import type { OrderRepository } from './ports.js';

export type CreateOrder = ReturnType<typeof makeCreateOrder>;

export const makeCreateOrder = (deps: { orderRepository: OrderRepository }) => {
  async function createOrder(tenantId: string, input: CreateOrderInput): Promise<OrderDto> {
    const order = placeOrder({ tenantId, ...input });
    await deps.orderRepository.add(order);
    return toOrderDto(order);
  }

  return createOrder;
};
