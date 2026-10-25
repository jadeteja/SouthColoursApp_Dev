export type Role = 'ROLE_CUSTOMER' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  roles: Role[];
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Address {
  id: number;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType: 'HOME' | 'OFFICE' | 'OTHER';
  isDefault: boolean;
}

export interface Category {
  id: number;
  parentId?: number | null;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  subcategories?: Category[];
}

export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  size: string;
  colorName: string;
  colorHex?: string;
  priceOverride?: number;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  isActive: boolean;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  fabric?: string;
  careInstructions?: string;
  ageGroup?: string;
  basePrice: number;
  discountPrice: number;
  discountPercentage?: number;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  videoUrl?: string;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface CartItem {
  id: number;
  variantId: number;
  product: {
    id: number;
    name: string;
    imageUrl: string;
    basePrice: number;
    discountPrice: number;
  };
  variant: {
    sku: string;
    size: string;
    colorName: string;
    availableStock: number;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  grandTotal: number;
  appliedCouponCode?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export type PaymentStatus =
  | 'CREATED'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'FAILED'
  | 'REFUNDED';

export interface OrderItem {
  id: number;
  variantId: number;
  productName: string;
  variantSku: string;
  size: string;
  color: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface TrackingEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: Address;
  trackingNumber?: string;
  courierName?: string;
  trackingEvents?: TrackingEvent[];
}

export interface Coupon {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  targetType: 'CATEGORY' | 'PRODUCT' | 'COLLECTION';
  targetId?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface DashboardMetrics {
  totalOrders: number;
  totalSales: number;
  newCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  salesOverview: { date: string; amount: number }[];
  topCategories: { categoryName: string; percentage: number; color?: string }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
