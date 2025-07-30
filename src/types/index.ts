export interface Product {
  id: string;
  name: string;
  category: 'vegetables' | 'spices' | 'fruits' | 'groceries';
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  stock: number;
  featured: boolean;
  unit: string;
  discount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryDate: string;
  deliveryTime: string;
  specialInstructions?: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverySlot {
  id: string;
  date: string;
  timeSlot: string;
  available: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  loading: boolean;
}