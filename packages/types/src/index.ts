// ==================================================
// QueueLess — Shared Types & Enums
// ==================================================

// ---- Enums ----

export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  BILLING = 'BILLING',
  COUNTER_STAFF = 'COUNTER_STAFF',
}

export enum ProductAvailability {
  AVAILABLE = 'AVAILABLE',
  SOLD_OUT = 'SOLD_OUT',
  DISABLED = 'DISABLED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  CASH_PENDING = 'CASH_PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  CASH = 'CASH',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ShopStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  TEMPORARILY_CLOSED = 'TEMPORARILY_CLOSED',
}

export enum CounterTicketStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
}

// ---- Domain Types ----

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: ShopStatus;
  openTime: string;
  closeTime: string;
  onlinePaymentEnabled: boolean;
  cashPaymentEnabled: boolean;
  taxPercent: number;
  orderPrefix: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffMembership {
  id: string;
  userId: string;
  shopId: string;
  role: UserRole;
  counterId: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Counter {
  id: string;
  shopId: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  shopId: string;
  categoryId: string;
  counterId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  availability: ProductAvailability;
  maxQuantity: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  shopId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  taxAmount: number;
  total: number;
  idempotencyKey: string | null;
  customerName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  counterId: string;
  counterName: string;
}

export interface Payment {
  id: string;
  orderId: string;
  shopId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  providerRef: string | null;
  providerData: string | null;
  confirmedAt: Date | null;
  confirmedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: string | null;
  note: string | null;
  createdAt: Date;
}

export interface CounterTicket {
  id: string;
  orderId: string;
  counterId: string;
  status: CounterTicketStatus;
  items: OrderItem[];
  acceptedAt: Date | null;
  readyAt: Date | null;
}

export interface AuditLog {
  id: string;
  shopId: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: Date;
}

// ---- DTOs ----

export interface CreateOrderDTO {
  shopId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: PaymentMethod;
  customerName?: string;
  idempotencyKey: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  shopName: string;
  createdAt: string;
}

export interface DashboardStats {
  todayOrders: number;
  todaySales: number;
  onlineOrders: number;
  cashOrders: number;
  pendingCash: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    shopId: string;
    shopName: string;
    counterId: string | null;
  };
}

// ---- Socket Events ----

export enum SocketEvent {
  JOIN_SHOP_ROOM = 'join:shop',
  JOIN_COUNTER_ROOM = 'join:counter',
  ORDER_CREATED = 'order:created',
  ORDER_UPDATED = 'order:updated',
  CASH_CONFIRMED = 'cash:confirmed',
  COUNTER_TICKET_UPDATED = 'counter:ticket:updated',
  PRODUCT_UPDATED = 'product:updated',
  CONNECTION_STATUS = 'connection:status',
}

export enum SocketEvents {
  ORDER_CREATED = 'order:created',
  ORDER_UPDATED = 'order:updated',
  CASH_CONFIRMED = 'cash:confirmed',
  COUNTER_TICKET_UPDATED = 'counter:ticket:updated',
  PRODUCT_UPDATED = 'product:updated',
  CONNECTION_STATUS = 'connection:status',
}

export interface SocketOrderPayload {
  order: OrderResponse;
  counterTickets?: CounterTicket[];
}

// ---- i18n ----

export type TranslationKey =
  | 'shop.closed'
  | 'shop.open'
  | 'shop.temporarilyClosed'
  | 'menu.search'
  | 'menu.allCategories'
  | 'menu.soldOut'
  | 'menu.noProducts'
  | 'cart.title'
  | 'cart.empty'
  | 'cart.subtotal'
  | 'cart.tax'
  | 'cart.total'
  | 'cart.proceed'
  | 'cart.clear'
  | 'checkout.title'
  | 'checkout.payOnline'
  | 'checkout.payAtCounter'
  | 'checkout.placeOrder'
  | 'checkout.processing'
  | 'order.confirmed'
  | 'order.created'
  | 'order.paymentSuccessful'
  | 'order.cashPending'
  | 'order.cashPendingMessage'
  | 'order.collectMessage'
  | 'order.downloadBill'
  | 'order.total'
  | 'error.shopClosed'
  | 'error.productUnavailable'
  | 'error.paymentFailed'
  | 'error.orderFailed'
  | 'error.connectionLost';

export type Translations = Record<TranslationKey, string>;

export const en: Translations = {
  'shop.closed': 'Shop Closed',
  'shop.open': 'Open',
  'shop.temporarilyClosed': 'Temporarily Closed',
  'menu.search': 'Search menu...',
  'menu.allCategories': 'All',
  'menu.soldOut': 'Sold Out',
  'menu.noProducts': 'No products available',
  'cart.title': 'Your Cart',
  'cart.empty': 'Your cart is empty',
  'cart.subtotal': 'Subtotal',
  'cart.tax': 'Tax',
  'cart.total': 'Total',
  'cart.proceed': 'Proceed to Checkout',
  'cart.clear': 'Clear Cart',
  'checkout.title': 'Checkout',
  'checkout.payOnline': 'Pay Online',
  'checkout.payAtCounter': 'Pay at Counter',
  'checkout.placeOrder': 'Place Order',
  'checkout.processing': 'Processing...',
  'order.confirmed': 'Order Confirmed',
  'order.created': 'Order Created',
  'order.paymentSuccessful': 'Payment Successful',
  'order.cashPending': 'Cash Payment Pending',
  'order.cashPendingMessage': 'Please show this screen at the payment counter.',
  'order.collectMessage': 'Please collect your order from the shop counters.',
  'order.downloadBill': 'Download Bill',
  'order.total': 'Total',
  'error.shopClosed': 'This shop is currently closed.',
  'error.productUnavailable': 'Some items are no longer available.',
  'error.paymentFailed': 'Payment failed. Please try again.',
  'error.orderFailed': 'Could not create order. Please try again.',
  'error.connectionLost': 'Connection lost. Reconnecting...',
};

export const ta: Partial<Translations> = {
  'shop.closed': 'கடை மூடப்பட்டது',
  'shop.open': 'திறந்துள்ளது',
  'menu.search': 'மெனுவில் தேடுங்கள்...',
  'menu.allCategories': 'அனைத்தும்',
  'menu.soldOut': 'விற்றுத் தீர்ந்தது',
  'cart.title': 'உங்கள் கூடை',
  'cart.empty': 'கூடை காலியாக உள்ளது',
  'cart.total': 'மொத்தம்',
  'cart.proceed': 'செலுத்தப் பாருங்கள்',
  'checkout.payOnline': 'ஆன்லைன் செலுத்து',
  'checkout.payAtCounter': 'கவுண்டரில் செலுத்து',
  'order.confirmed': 'ஆர்டர் உறுதிசெய்யப்பட்டது',
  'order.downloadBill': 'பில் பதிவிறக்கம்',
};

export const hi: Partial<Translations> = {
  'shop.closed': 'दुकान बंद है',
  'shop.open': 'खुला है',
  'menu.search': 'मेनू में खोजें...',
  'menu.allCategories': 'सभी',
  'menu.soldOut': 'बिक गया',
  'cart.title': 'आपकी कार्ट',
  'cart.empty': 'कार्ट खाली है',
  'cart.total': 'कुल',
  'cart.proceed': 'चेकआउट करें',
  'checkout.payOnline': 'ऑनलाइन भुगतान',
  'checkout.payAtCounter': 'काउंटर पर भुगतान',
  'order.confirmed': 'ऑर्डर कन्फर्म',
  'order.downloadBill': 'बिल डाउनलोड करें',
};
