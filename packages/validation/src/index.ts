import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'),
  addressLine1: z.string().min(5, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit Indian PIN code'),
  addressType: z.enum(['HOME', 'OFFICE', 'OTHER']),
  isDefault: z.boolean().default(false),
});

export const productVariantSchema = z.object({
  sku: z.string().min(3, 'SKU is required'),
  size: z.string().min(1, 'Size is required'),
  colorName: z.string().min(1, 'Color name is required'),
  colorHex: z.string().optional(),
  priceOverride: z.number().positive().optional(),
  stockQuantity: z.number().int().nonnegative('Stock cannot be negative'),
});

export const productFormSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  description: z.string().min(10, 'Detailed description is required'),
  categoryId: z.number().positive('Select a valid category'),
  subcategoryId: z.number().positive().optional(),
  brand: z.string().default('Southcolours'),
  fabric: z.string().optional(),
  careInstructions: z.string().optional(),
  ageGroup: z.string().optional(),
  basePrice: z.number().positive('Base price must be greater than 0'),
  discountPrice: z.number().positive('Discount price must be greater than 0'),
  variants: z.array(productVariantSchema).min(1, 'At least one variant (size/color/stock) is required'),
  images: z.array(z.string().url()).min(1, 'At least one product image is required'),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const couponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().positive('Discount value must be positive'),
  minOrderAmount: z.number().nonnegative().default(0),
  maxDiscountAmount: z.number().positive().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductFormInput = z.infer<typeof productFormSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
