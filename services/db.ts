import { Product, ProductSpecification, PCBuilderPart, PartType, CustomBanner, User, Customer } from '../types';

/**
 * NOTA PARA ZEI:
 * Este archivo simula la respuesta de la base de datos PostgreSQL (Neon).
 */

// --- DATOS SIMULADOS (Español) ---

export const MOCK_BANNERS: CustomBanner[] = [
  {
    id: '1',
    type: 'hero_main',
    title: 'Z-One Cover', 
    subtitle: '',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1920&auto=format&fit=crop',
    cta_text: ''
  },
  {
    id: '2',
    type: 'featured_promo',
    title: 'OFERTA DESTACADA: SERIE RTX 40',
    subtitle: 'Potencia gráfica para renderizado 3D y simulaciones complejas.',
    image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1600&auto=format&fit=crop',
    cta_text: 'VER PRODUCTO',
    target_route: 'prod_001' // ID del producto Spectre X1 para abrir modal
  }
];

export const MOCK_INVENTORY: Product[] = [
  {
    product_id: 'prod_001',
    name: 'Z-One Spectre X1',
    price: 1899.99,
    category: 'laptop',
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop'
  },
  {
    product_id: 'prod_002',
    name: 'Z-One Phantom G15',
    price: 1450.00,
    category: 'laptop',
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop'
  },
  {
    product_id: 'prod_003',
    name: 'Logitech MX Master 3S',
    price: 99.99,
    category: 'accessory',
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop'
  }
];

export const MOCK_SPECS: Record<string, ProductSpecification> = {
  'prod_001': {
    spec_id: 'spec_001',
    product_id: 'prod_001',
    cpu: 'Intel Core i9-13900H',
    ram: '32GB DDR5 5600MHz',
    gpu: 'NVIDIA RTX 4080 12GB',
    storage: '2TB NVMe Gen4 SSD',
    display: '16" OLED 4K 120Hz',
    ports: '2x Thunderbolt 4, 2x USB-A, HDMI 2.1'
  },
  'prod_002': {
    spec_id: 'spec_002',
    product_id: 'prod_002',
    cpu: 'AMD Ryzen 7 7840HS',
    ram: '16GB DDR5',
    gpu: 'NVIDIA RTX 4060 8GB',
    storage: '1TB NVMe SSD',
    display: '15.6" IPS QHD 165Hz',
    ports: '1x USB-C, 3x USB-A, HDMI 2.1'
  }
};

export const MOCK_PC_PARTS: PCBuilderPart[] = [
  // CPUs
  { part_id: 'cpu_1', name: 'Intel Core i9-13900K', type: PartType.CPU, price: 589, image_url: 'https://via.placeholder.com/100', socket_type: 'LGA1700', wattage: 125 },
  { part_id: 'cpu_2', name: 'AMD Ryzen 9 7950X', type: PartType.CPU, price: 550, image_url: 'https://via.placeholder.com/100', socket_type: 'AM5', wattage: 170 },
  
  // Placas Base
  { part_id: 'mobo_1', name: 'ASUS ROG Maximus Z790', type: PartType.MOTHERBOARD, price: 499, image_url: 'https://via.placeholder.com/100', socket_type: 'LGA1700', supported_ram_type: 'DDR5', form_factor: 'ATX' },
  { part_id: 'mobo_2', name: 'MSI PRO Z790-P', type: PartType.MOTHERBOARD, price: 219, image_url: 'https://via.placeholder.com/100', socket_type: 'LGA1700', supported_ram_type: 'DDR4', form_factor: 'ATX' },
  { part_id: 'mobo_3', name: 'Gigabyte X670E AORUS', type: PartType.MOTHERBOARD, price: 399, image_url: 'https://via.placeholder.com/100', socket_type: 'AM5', supported_ram_type: 'DDR5', form_factor: 'ATX' },

  // RAM
  { part_id: 'ram_1', name: 'Corsair Vengeance 32GB (2x16) DDR5', type: PartType.RAM, price: 129, image_url: 'https://via.placeholder.com/100', supported_ram_type: 'DDR5' },
  { part_id: 'ram_2', name: 'G.Skill Ripjaws 32GB (2x16) DDR4', type: PartType.RAM, price: 79, image_url: 'https://via.placeholder.com/100', supported_ram_type: 'DDR4' },

  // GPU
  { part_id: 'gpu_1', name: 'NVIDIA RTX 4090 24GB', type: PartType.GPU, price: 1599, image_url: 'https://via.placeholder.com/100', wattage: 450 },
  { part_id: 'gpu_2', name: 'NVIDIA RTX 4070 Ti 12GB', type: PartType.GPU, price: 799, image_url: 'https://via.placeholder.com/100', wattage: 285 },
  
  // Storage
  { part_id: 'stor_1', name: 'Samsung 990 PRO 2TB NVMe', type: PartType.STORAGE, price: 169, image_url: 'https://via.placeholder.com/100' },
  { part_id: 'stor_2', name: 'WD Black SN850X 1TB NVMe', type: PartType.STORAGE, price: 99, image_url: 'https://via.placeholder.com/100' },

  // PSU
  { part_id: 'psu_1', name: 'Corsair RM1000e 1000W Gold', type: PartType.PSU, price: 179, image_url: 'https://via.placeholder.com/100', wattage: 1000 },
  { part_id: 'psu_2', name: 'EVGA SuperNOVA 850W Gold', type: PartType.PSU, price: 139, image_url: 'https://via.placeholder.com/100', wattage: 850 },

  // Case
  { part_id: 'case_1', name: 'NZXT H9 Flow', type: PartType.CASE, price: 159, image_url: 'https://via.placeholder.com/100', form_factor: 'ATX' },
  { part_id: 'case_2', name: 'Corsair 4000D Airflow', type: PartType.CASE, price: 104, image_url: 'https://via.placeholder.com/100', form_factor: 'ATX' },
];

// --- LLAMADAS ASÍNCRONAS SIMULADAS ---

export const getBanner = async (type: string): Promise<CustomBanner | undefined> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_BANNERS.find(b => b.type === type)), 300));
};

export const getProducts = async (): Promise<Product[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_INVENTORY), 500));
};

export const getProductSpecs = async (productId: string): Promise<ProductSpecification | undefined> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_SPECS[productId]), 200));
};

export const getPCParts = async (type: PartType): Promise<PCBuilderPart[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_PC_PARTS.filter(p => p.type === type)), 300));
};

export const registerUser = async (user: User, customer: Customer): Promise<{success: boolean, message: string, user?: User}> => {
    // 1. Simulación de Validación de PRIMARY KEY (username)
    console.log(`DB CHECK: SELECT 1 FROM users WHERE username = '${user.username}'`);
    if (user.username === 'admin' || user.username === 'existing_user') {
      return { success: false, message: 'Error: El nombre de usuario ya está registrado (PK Violation).' };
    }

    // 2. Simulación de Validación de UNIQUE (email)
    console.log(`DB CHECK: SELECT 1 FROM users WHERE email = '${user.email}'`);
    if (user.email === 'test@example.com') {
        return { success: false, message: 'Error: El correo electrónico ya está en uso (Unique Constraint).' };
    }
    
    // 3. Simular DB Insert en Ambas tablas (Transacción)
    console.log("DB TRANSACTION START");
    console.log(`DB INSERT: INTO users (username, email, created_at) VALUES ('${user.username}', '${user.email}', NOW())`);
    console.log(`DB INSERT: INTO customers (cedula, username, full_name, ...) VALUES ('${customer.cedula}', '${user.username}', ...)`);
    console.log("DB TRANSACTION COMMIT");
    
    const userWithCustomer = { ...user, customer_data: customer };
    
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, message: 'Cuenta creada exitosamente.', user: userWithCustomer }), 1000));
}