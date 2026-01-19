
export interface Product {
  id: string | number; // <--- Cambio importante: Aceptamos UUIDs
  name: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  image: string;
  specs: string[];
}

export interface CartItem extends Product {
  quantity: number;
}