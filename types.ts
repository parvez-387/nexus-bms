
export interface ProductItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
  amount: number;
  remarks: string;
}

export interface CostItem {
  id: string;
  category: string;
  amount: number;
  remarks: string;
}

export interface Shipment {
  id: string;
  name: string;
  date: string;
  receivingWarehouse: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'loss' | 'shipped';
  products: ProductItem[];
  costs: CostItem[];
  notes: string;
  totalProfit: number;
}

export interface Transfer {
  id: string;
  productName: string;
  qty: number;
  fromLocation: string;
  toLocation: string;
  date: string;
  transportCost: number;
  paymentMethod: string;
  status: 'in-transit' | 'arrived';
  notes: string;
}

export interface Sale {
  id: string;
  customerName: string;
  date: string;
  items: {
    productName: string;
    qty: number;
    rate: number;
    amount: number;
  }[];
  totalAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod: string;
  notes: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  payee: string;
  paymentMethod: string;
  notes: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  baseRate: number;
  unit: string;
  description: string;
}

export type ReferenceType = string;

export interface Reference {
  id: string;
  type: ReferenceType;
  label: string;
}

export type UserRole = 'admin' | 'manager' | 'staff';
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  permissions: string[];
  createdAt: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'shipment' | 'sale' | 'inventory' | 'cost' | 'transfer' | 'expense' | 'product' | 'reference' | 'user';
}

export interface LocationStock {
  productName: string;
  location: string;
  available: number;
}

export interface StockItem {
  name: string;
  available: number; // Total across all locations
  committed: number;
  incoming: number;
}

export type ViewType = 
  | 'dashboard' 
  | 'shipments' | 'create-shipment' 
  | 'inventory' 
  | 'sales' | 'create-sale' 
  | 'reports' 
  | 'transfers' | 'create-transfer' 
  | 'expenses' | 'create-expense'
  | 'products' | 'create-product'
  | 'references' | 'create-reference'
  | 'users' | 'create-user'
  | 'settings';
