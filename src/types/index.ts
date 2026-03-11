export interface Profile {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount_price: number | null;
  description: string;
  image_url: string;
  category: string;
  sizes: string[];
  stock: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size: string;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  payment_method: string;
  shipping_address: string;
  delivery_date: string;
  status: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  size: string;
  price: number;
  created_at: string;
  product?: Product;
}
