export type Address = {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderStatus = 'pending' | 'printing' | 'shipped' | 'delivered';

export type PrintOrder = {
  id: string;
  bookId: string;
  userId: string;
  format: '10x10' | '15x15';
  quantity: number;
  shippingAddress: Address;
  printProvider: 'gelato' | 'peecho';
  providerOrderId?: string;
  status: OrderStatus;
  trackingUrl?: string;
  createdAt: string;
};
