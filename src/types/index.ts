// User Types
export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface Order {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Chat Types
export interface ChatMessage {
  _id: string;
  userId: string;
  message: string;
  response: string;
  intent: string;
  timestamp: Date;
}

export interface ChatHistory {
  _id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Chat Intent Types
export type ChatIntent = 
  | 'browse_products'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'view_cart'
  | 'checkout'
  | 'general_inquiry'
  | 'unknown';

export interface ChatIntentResult {
  intent: ChatIntent;
  entities: {
    productName?: string;
    category?: string;
    size?: string;
    color?: string;
    quantity?: number;
  };
  confidence: number;
}
