// Matching the requested PostgreSQL Schema

export interface User {
  username: string; // PK
  email: string;
  created_at: string;
  customer_data?: Customer; // Optional link to customer data
}

export interface Customer {
  cedula: string; // PK: V-XXXXXXXX
  username: string; // FK -> User.username
  full_name: string;
  phone: string;
  address: string;
}

export interface Product {
  product_id: string; // PK
  name: string;
  price: number;
  image_url: string;
  category: 'laptop' | 'component' | 'accessory';
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
  isBuilderPart?: boolean; // Para aplicar el 5% de descuento
}

export interface ProductSpecification {
  spec_id: string;
  product_id: string; // FK -> Product.product_id
  cpu: string;
  ram: string;
  gpu: string;
  storage: string;
  display: string;
  ports: string;
}

// Extended Inventory for PC Builder
export enum PartType {
  CPU = 'CPU',
  MOTHERBOARD = 'MOTHERBOARD',
  RAM = 'RAM',
  GPU = 'GPU',
  STORAGE = 'STORAGE',
  PSU = 'PSU',
  CASE = 'CASE'
}

export interface PCBuilderPart {
  part_id: string;
  name: string;
  type: PartType;
  price: number;
  image_url: string;
  // Compatibility columns
  socket_type?: string;        // For CPU and Motherboard
  supported_ram_type?: string; // For Motherboard and RAM (e.g., DDR4, DDR5)
  wattage?: number;            // For PSU calculation
  form_factor?: string;        // ATX, mATX
}

export interface CustomBanner {
  id: string;
  type: 'hero_main' | 'featured_promo';
  image_url: string;
  title: string;
  subtitle: string;
  cta_text: string;
  target_route?: string; // Ruta destino o ID de producto
}

// --- CHECKOUT TYPES ---

export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'pago_movil' | 'zelle' | 'cash' | 'transfer';

export interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  discount: number;
  assemblyCost: number;
  tax: number;
  total: number;
  customer: {
    fullName: string;
    cedula: string;
    fiscalAddress: string;
    phone: string;
  };
  delivery: {
    method: DeliveryMethod;
    shippingAddress?: string;
  };
  payment: {
    method: PaymentMethod;
    reference?: string;
  };
}