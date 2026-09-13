import { z } from 'zod';

// ---- Auth ----

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

// ---- Order Creation ----

export const createOrderSchema = z.object({
  shopId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, 'At least one item required'),
  paymentMethod: z.enum(['ONLINE', 'CASH']),
  customerName: z.string().max(100).optional(),
  customerPhone: z.string().max(20).optional(),
  idempotencyKey: z.string().optional(),
});

// ---- Product Management ----

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).default(''),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1),
  counterId: z.string().min(1),
  imageUrl: z.string().url().nullable().optional(),
  availability: z.enum(['AVAILABLE', 'SOLD_OUT', 'DISABLED']).default('AVAILABLE'),
  maxQuantity: z.number().int().min(1).max(100).default(20),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();

// ---- Category Management ----

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

// ---- Counter Management ----

export const createCounterSchema = z.object({
  name: z.string().min(1).max(50),
  code: z.string().min(1).max(10),
  isActive: z.boolean().default(true),
});

export const updateCounterSchema = createCounterSchema.partial();

// ---- Staff Management ----

export const createStaffSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'BILLING', 'COUNTER_STAFF']),
  counterId: z.string().nullable().optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'BILLING', 'COUNTER_STAFF']).optional(),
  counterId: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// ---- Shop Settings ----

export const shopSettingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'TEMPORARILY_CLOSED']).optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  onlinePaymentEnabled: z.boolean().optional(),
  cashPaymentEnabled: z.boolean().optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  orderPrefix: z.string().max(5).optional(),
});

// ---- Manual Order ----

export const manualOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1),
  paymentMethod: z.enum(['ONLINE', 'CASH']),
  customerName: z.string().max(100).optional(),
});
