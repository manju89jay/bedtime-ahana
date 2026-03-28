import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const originalEnv = process.env;

describe('print order service (stub mode)', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, USE_STUBS: 'true' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates a print order for 10x10', async () => {
    const { createPrintOrder } = await import('@/lib/services/print-order');
    const result = await createPrintOrder({
      bookId: 'book-1',
      userId: 'user-1',
      format: '10x10',
      quantity: 2,
      shippingAddress: {
        name: 'Max Mustermann',
        street: 'Hauptstr. 1',
        city: 'Ulm',
        postalCode: '89073',
        country: 'DE',
      },
    });

    expect(result.order.id).toBeTruthy();
    expect(result.order.bookId).toBe('book-1');
    expect(result.order.userId).toBe('user-1');
    expect(result.order.format).toBe('10x10');
    expect(result.order.quantity).toBe(2);
    expect(result.order.status).toBe('pending');
    expect(result.order.printProvider).toBe('gelato');
    expect(result.order.shippingAddress.city).toBe('Ulm');
  });

  it('creates a print order for 15x15', async () => {
    const { createPrintOrder } = await import('@/lib/services/print-order');
    const result = await createPrintOrder({
      bookId: 'book-2',
      userId: 'user-2',
      format: '15x15',
      quantity: 1,
      shippingAddress: {
        name: 'Anna Schmidt',
        street: 'Berliner Str. 5',
        city: 'Berlin',
        postalCode: '10115',
        country: 'DE',
      },
    });

    expect(result.order.format).toBe('15x15');
    expect(result.order.status).toBe('pending');
  });

  it('returns unique order IDs', async () => {
    const { createPrintOrder } = await import('@/lib/services/print-order');
    const address = { name: 'Test', street: 'St', city: 'C', postalCode: '00000', country: 'DE' };
    const r1 = await createPrintOrder({ bookId: 'b1', userId: 'u1', format: '10x10', quantity: 1, shippingAddress: address });
    const r2 = await createPrintOrder({ bookId: 'b2', userId: 'u1', format: '10x10', quantity: 1, shippingAddress: address });
    expect(r1.order.id).not.toBe(r2.order.id);
  });

  it('gets order status', async () => {
    const { getOrderStatus } = await import('@/lib/services/print-order');
    const order = await getOrderStatus('order-123');
    expect(order).toBeDefined();
    expect(order?.status).toBe('pending');
  });
});
