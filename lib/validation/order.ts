import { z } from 'zod';

export const AddressSchema = z.object({
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export const OrderStatusSchema = z.enum(['pending', 'printing', 'shipped', 'delivered']);

export const PrintOrderSchema = z.object({
  id: z.string().min(1),
  bookId: z.string().min(1),
  userId: z.string().min(1),
  format: z.enum(['10x10', '15x15']),
  quantity: z.number().int().min(1),
  shippingAddress: AddressSchema,
  printProvider: z.enum(['gelato', 'peecho']),
  providerOrderId: z.string().optional(),
  status: OrderStatusSchema,
  trackingUrl: z.string().optional(),
  createdAt: z.string(),
});
