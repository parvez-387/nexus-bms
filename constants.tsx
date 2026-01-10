
import { Activity, Shipment, StockItem, Transfer, LocationStock, Product } from './types';

export const PRODUCT_NAMES = ["Ajwa", "Safawi", "Mabroom", "Medjool", "Deglet Noor", "Sukkari"];
export const PRODUCT_CATEGORIES = ["Premium Dates", "Regular Dates", "Value Pack", "Gift Set"];
export const COST_CATEGORIES = ["Product Cost", "Port Cost", "Transport", "Customs", "Storage", "Packaging", "Marketing"];
export const EXPENSE_CATEGORIES = ["Office Rent", "Electricity Bill", "Internet", "Staff Salary", "Office Maintenance", "Travel", "Miscellaneous"];
export const LOCATIONS = ["Dhaka Warehouse", "Chittagong Port", "Sylhet Hub", "Rajshahi Store", "Khulna Depot"];

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Ajwa', category: 'Premium Dates', baseRate: 850, unit: 'kg', description: 'Premium Saudi Ajwa' },
  { id: '2', name: 'Safawi', category: 'Premium Dates', baseRate: 650, unit: 'kg', description: 'Soft and dark' },
  { id: '3', name: 'Mabroom', category: 'Premium Dates', baseRate: 750, unit: 'kg', description: 'Long and thin' },
  { id: '4', name: 'Medjool', category: 'Regular Dates', baseRate: 1100, unit: 'kg', description: 'Large and sweet' },
  { id: '5', name: 'Deglet Noor', category: 'Regular Dates', baseRate: 450, unit: 'kg', description: 'Semi-dry' },
  { id: '6', name: 'Sukkari', category: 'Regular Dates', baseRate: 550, unit: 'kg', description: 'Golden and sweet' },
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: '1',
    name: "Saudi Ramadan Batch",
    date: "2024-01-15",
    receivingWarehouse: "Dhaka Warehouse",
    paymentMethod: "Cash",
    status: 'completed',
    products: [{ id: 'p1', name: 'Ajwa', qty: 500, rate: 850, amount: 425000, remarks: 'High Quality' }],
    costs: [{ id: 'c1', category: 'Transport', amount: 15000, remarks: 'Sea Freight' }],
    notes: "First batch for the season",
    totalProfit: 410000
  }
];

export const INITIAL_TRANSFERS: Transfer[] = [
  {
    id: 't1',
    productName: 'Ajwa',
    qty: 100,
    fromLocation: 'Chittagong Port',
    toLocation: 'Dhaka Warehouse',
    date: '2024-02-20',
    transportCost: 5500,
    paymentMethod: 'Cash',
    status: 'arrived',
    notes: 'Urgent stock replenishment'
  }
];

export const INITIAL_LOCATION_STOCK: LocationStock[] = [
  { productName: 'Ajwa', location: 'Dhaka Warehouse', available: 500 },
  { productName: 'Ajwa', location: 'Chittagong Port', available: 750 },
  { productName: 'Safawi', location: 'Dhaka Warehouse', available: 440 },
  { productName: 'Safawi', location: 'Sylhet Hub', available: 400 },
  { productName: 'Mabroom', location: 'Rajshahi Store', available: 620 },
  { productName: 'Medjool', location: 'Khulna Depot', available: 410 }
];

export const INITIAL_STOCK: StockItem[] = [
  { name: 'Ajwa', available: 1250, committed: 300, incoming: 500 },
  { name: 'Safawi', available: 840, committed: 120, incoming: 200 },
  { name: 'Mabroom', available: 620, committed: 50, incoming: 0 },
  { name: 'Medjool', available: 410, committed: 100, incoming: 300 }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  { id: '1', title: 'Shipment Created', description: 'Saudi Ramadan Batch initialized', time: '2 hours ago', type: 'shipment' },
  { id: '2', title: 'Stock Transfer', description: '100kg Ajwa moved to Dhaka', time: 'Yesterday', type: 'transfer' }
];
