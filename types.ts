export interface Product {
  id: string | number;
  name: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  image: string;
  specs: string[];
  description?: string; // Para la descripción larga
  detalles?: string;    // Alias para la descripción larga (compatibilidad)
  stock?: number;       // Opcional, para manejo de inventario
}

export interface CartItem extends Product {
  quantity: number;
}

// ESTA ERA LA INTERFAZ QUE FALTABA:
export interface User {
  id: string | number;
  nombre: string;
  email: string;
  rol: 'cliente' | 'admin' | 'cajero';
}