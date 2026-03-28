import type { PrintOrder, Address } from '@/types/order';
import { createBookId } from '@/lib/id';

export type CreateOrderInput = {
  bookId: string;
  userId: string;
  format: '10x10' | '15x15';
  quantity: number;
  shippingAddress: Address;
};

export type OrderResult = {
  order: PrintOrder;
};

const isStubMode = () => process.env.USE_STUBS === 'true';

function createOrderStub(input: CreateOrderInput): OrderResult {
  const order: PrintOrder = {
    id: `order-${createBookId().slice(5)}`,
    bookId: input.bookId,
    userId: input.userId,
    format: input.format,
    quantity: input.quantity,
    shippingAddress: input.shippingAddress,
    printProvider: 'gelato',
    providerOrderId: `gelato-stub-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  return { order };
}

export async function createPrintOrder(input: CreateOrderInput): Promise<OrderResult> {
  if (isStubMode()) {
    return createOrderStub(input);
  }

  // Live mode: Gelato API integration
  const apiKey = process.env.GELATO_API_KEY;
  if (!apiKey) {
    console.warn('GELATO_API_KEY not set, using print order stub');
    return createOrderStub(input);
  }

  // Future: POST to Gelato API
  return createOrderStub(input);
}

export async function getOrderStatus(orderId: string): Promise<PrintOrder | null> {
  // Stub: return a mock order with pending status
  if (isStubMode() || !process.env.GELATO_API_KEY) {
    return {
      id: orderId,
      bookId: 'unknown',
      userId: 'unknown',
      format: '10x10',
      quantity: 1,
      shippingAddress: {
        name: 'Stub',
        street: 'Stub St',
        city: 'Stub City',
        postalCode: '00000',
        country: 'DE',
      },
      printProvider: 'gelato',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }

  return null;
}
