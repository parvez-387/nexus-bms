
import React, { useState, useEffect, useMemo } from 'react';
import { ViewType, Shipment, Activity, StockItem, Transfer, Sale, Expense, LocationStock, Product, Reference, User } from './types';
import { INITIAL_SHIPMENTS, INITIAL_ACTIVITIES, INITIAL_STOCK, INITIAL_TRANSFERS, INITIAL_LOCATION_STOCK, INITIAL_PRODUCTS, LOCATIONS, PRODUCT_CATEGORIES, EXPENSE_CATEGORIES, COST_CATEGORIES } from './constants';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ShipmentForm from './components/ShipmentForm';
import ShipmentList from './components/ShipmentList';
import TransferForm from './components/TransferForm';
import TransferList from './components/TransferList';
import SaleForm from './components/SaleForm';
import SaleList from './components/SaleList';
import InventoryView from './components/InventoryView';
import ReportsView from './components/ReportsView';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import ReferenceForm from './components/ReferenceForm';
import ReferenceList from './components/ReferenceList';
import UserForm from './components/UserForm';
import UserList from './components/UserList';
import Login from './components/Login';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('nexus_api_url') || "");

  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS as any);
  const [transfers, setTransfers] = useState<Transfer[]>(INITIAL_TRANSFERS as any);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [references, setReferences] = useState<Reference[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [refTypes, setRefTypes] = useState<string[]>(['location', 'product-category', 'expense-category', 'cost-category', 'payment-method']);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [stock, setStock] = useState<StockItem[]>(INITIAL_STOCK);
  const [locationStock, setLocationStock] = useState<LocationStock[]>(INITIAL_LOCATION_STOCK);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingReference, setEditingReference] = useState<Reference | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const dynamicProductNames = useMemo(() => products.map(p => p.name), [products]);
  const dynamicLocations = useMemo(() => references.filter(r => r.type === 'location').map(r => r.label), [references]);
  const dynamicProductCategories = useMemo(() => references.filter(r => r.type === 'product-category').map(r => r.label), [references]);
  const dynamicExpenseCategories = useMemo(() => references.filter(r => r.type === 'expense-category').map(r => r.label), [references]);
  const dynamicCostCategories = useMemo(() => references.filter(r => r.type === 'cost-category').map(r => r.label), [references]);
  const dynamicWallets = useMemo(() => references.filter(r => r.type === 'payment-method').map(r => r.label), [references]);

  useEffect(() => {
    const fetchData = async () => {
      setSyncStatus('loading');
      try {
        if (apiUrl && apiUrl.startsWith('http')) {
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const cloudData = await response.json();
          if (cloudData && typeof cloudData === 'object' && Object.keys(cloudData).length > 0) {
            applyData(cloudData);
            setSyncStatus('success');
            return;
          }
        }
      } catch (err) {
        setSyncStatus('error');
      }

      const saved = localStorage.getItem('nexus_bms_data_v13');
      if (saved) {
        try {
          applyData(JSON.parse(saved));
          setSyncStatus('success');
        } catch (e) {
          setupDefaultState();
        }
      } else {
        setupDefaultState();
        setSyncStatus('idle');
      }
    };
    fetchData();
  }, [apiUrl]);

  const applyData = (parsed: any) => {
    setShipments(parsed.shipments || INITIAL_SHIPMENTS);
    setTransfers(parsed.transfers || INITIAL_TRANSFERS);
    setSales(parsed.sales || []);
    setExpenses(parsed.expenses || []);
    setProducts(parsed.products || INITIAL_PRODUCTS);
    setReferences(parsed.references || []);
    setUsers(parsed.users || []);
    setRefTypes(parsed.refTypes || ['location', 'product-category', 'expense-category', 'cost-category', 'payment-method']);
    setActivities(parsed.activities || INITIAL_ACTIVITIES);
    setStock(parsed.stock || INITIAL_STOCK);
    setLocationStock(parsed.locationStock || INITIAL_LOCATION_STOCK);
    
    const savedSession = localStorage.getItem('nexus_session');
    if (savedSession) {
      const found = (parsed.users || []).find((u: User) => u.id === savedSession);
      if (found) setCurrentUser(found);
    }
  };

  const setupDefaultState = () => {
    const initialRefs: Reference[] = [
      ...LOCATIONS.map((l, i) => ({ id: `L-${i}`, type: 'location', label: l })),
      ...PRODUCT_CATEGORIES.map((c, i) => ({ id: `PC-${i}`, type: 'product-category', label: c })),
      ...EXPENSE_CATEGORIES.map((c, i) => ({ id: `EC-${i}`, type: 'expense-category', label: c })),
      ...COST_CATEGORIES.map((c, i) => ({ id: `CC-${i}`, type: 'cost-category', label: c })),
      { id: 'W-1', type: 'payment-method', label: 'Cash' },
      { id: 'W-2', type: 'payment-method', label: 'Bank Account' },
    ];
    setReferences(initialRefs);
    setUsers([{
      id: 'u-1',
      name: 'Super Admin',
      email: 'admin@nexus.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      permissions: ['all'],
      createdAt: new Date().toISOString()
    }]);
  };

  useEffect(() => {
    const syncToCloud = async () => {
      const payload = { 
        shipments, transfers, sales, expenses, products, references, refTypes, activities, stock, locationStock, users 
      };
      localStorage.setItem('nexus_bms_data_v13', JSON.stringify(payload));
      if (apiUrl && apiUrl.startsWith('http') && currentUser) {
        setIsSyncing(true);
        try {
          await fetch(apiUrl, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
          });
          setSyncStatus('success');
        } catch (err) {
          setSyncStatus('error');
        } finally {
          setTimeout(() => setIsSyncing(false), 1500);
        }
      }
    };
    const timer = setTimeout(() => { if (currentUser) syncToCloud(); }, 4000);
    return () => clearTimeout(timer);
  }, [shipments, transfers, sales, expenses, products, references, refTypes, activities, stock, locationStock, users, apiUrl, currentUser]);

  const handleLogin = (email: string, pass: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) {
      if (user.status !== 'active') return false;
      setCurrentUser(user);
      localStorage.setItem('nexus_session', user.id);
      return true;
    }
    return false;
  };

  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem('nexus_session'); };
  const navigate = (view: ViewType) => {
    setCurrentView(view);
    setEditingShipment(null); setEditingTransfer(null); setEditingSale(null); setEditingExpense(null);
    setEditingProduct(null); setEditingReference(null); setEditingUser(null);
    if (window.innerWidth <= 1024) setIsSidebarOpen(false);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} currentView={currentView} setCurrentView={navigate} isDarkMode={isDarkMode} user={currentUser} />
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${isSidebarOpen && window.innerWidth > 1024 ? 'lg:ml-64' : ''}`}>
        <Navbar userName={currentUser.name} userRole={currentUser.role} currentView={currentView} toggleTheme={() => { setIsDarkMode(!isDarkMode); document.documentElement.classList.toggle('dark'); }} isDarkMode={isDarkMode} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onLogout={handleLogout} syncStatus={isSyncing ? 'loading' : syncStatus} />
        <main className="p-4 md:p-6 flex-1 w-full max-w-7xl mx-auto">
          {currentView === 'dashboard' && <Dashboard shipments={shipments} transfers={transfers} activities={activities} stock={stock} onEditShipment={(s) => { setEditingShipment(s); navigate('create-shipment'); }} />}
          {currentView === 'create-shipment' && <ShipmentForm onSave={(s) => { if (editingShipment) setShipments(prev => prev.map(old => old.id === s.id ? s : old)); else setShipments(prev => [s, ...prev]); setEditingShipment(null); navigate('dashboard'); }} onCancel={() => { navigate('dashboard'); setEditingShipment(null); }} initialData={editingShipment} productNames={dynamicProductNames} costCategories={dynamicCostCategories} locations={dynamicLocations} wallets={dynamicWallets} />}
          {currentView === 'shipments' && <ShipmentList shipments={shipments} onEdit={(s) => { setEditingShipment(s); navigate('create-shipment'); }} onDelete={(id) => setShipments(prev => prev.filter(s => s.id !== id))} />}
          {currentView === 'transfers' && <TransferList transfers={transfers} onEdit={(t) => { setEditingTransfer(t); navigate('create-transfer'); }} onDelete={(id) => setTransfers(prev => prev.filter(t => t.id !== id))} onCreate={() => navigate('create-transfer')} />}
          {currentView === 'create-transfer' && <TransferForm onSave={(t) => { if (editingTransfer) setTransfers(prev => prev.map(old => old.id === t.id ? t : old)); else setTransfers(prev => [t, ...prev]); setEditingTransfer(null); navigate('transfers'); }} onCancel={() => { navigate('transfers'); setEditingTransfer(null); }} initialData={editingTransfer} locationStock={locationStock} productNames={dynamicProductNames} locations={dynamicLocations} wallets={dynamicWallets} />}
          {currentView === 'sales' && <SaleList sales={sales} onEdit={(s) => { setEditingSale(s); navigate('create-sale'); }} onDelete={(id) => setSales(prev => prev.filter(s => s.id !== id))} onCreate={() => navigate('create-sale')} />}
          {currentView === 'create-sale' && <SaleForm onSave={(s) => { if (editingSale) setSales(prev => prev.map(old => old.id === s.id ? s : old)); else setSales(prev => [s, ...prev]); setEditingSale(null); navigate('sales'); }} onCancel={() => { navigate('sales'); setEditingSale(null); }} initialData={editingSale} stock={stock} productNames={dynamicProductNames} wallets={dynamicWallets} />}
          {currentView === 'inventory' && <InventoryView stock={stock} locationStock={locationStock} productNames={dynamicProductNames} locations={dynamicLocations} />}
          {currentView === 'expenses' && <ExpenseList expenses={expenses} onEdit={(e) => { setEditingExpense(e); navigate('create-expense'); }} onDelete={(id) => setExpenses(prev => prev.filter(e => e.id !== id))} onCreate={() => navigate('create-expense')} />}
          {currentView === 'create-expense' && <ExpenseForm onSave={(e) => { if (editingExpense) setExpenses(prev => prev.map(old => old.id === e.id ? e : old)); else setExpenses(prev => [e, ...prev]); setEditingExpense(null); navigate('expenses'); }} onCancel={() => { navigate('expenses'); setEditingExpense(null); }} initialData={editingExpense} expenseCategories={dynamicExpenseCategories} wallets={dynamicWallets} />}
          {currentView === 'products' && <ProductList products={products} onEdit={(p) => { setEditingProduct(p); navigate('create-product'); }} onDelete={(id) => setProducts(prev => prev.filter(p => p.id !== id))} onCreate={() => navigate('create-product')} />}
          {currentView === 'create-product' && <ProductForm onSave={(p) => { if (editingProduct) setProducts(prev => prev.map(old => old.id === p.id ? p : old)); else setProducts(prev => [...prev, p]); setEditingProduct(null); navigate('products'); }} onCancel={() => { navigate('products'); setEditingProduct(null); }} initialData={editingProduct} productCategories={dynamicProductCategories} />}
          {currentView === 'references' && <ReferenceList references={references} refTypes={refTypes} onEdit={(r) => { setEditingReference(r); navigate('create-reference'); }} onDelete={(id) => setReferences(prev => prev.filter(r => r.id !== id))} onCreate={() => navigate('create-reference')} />}
          {currentView === 'create-reference' && <ReferenceForm refTypes={refTypes} onSave={(r) => { if (editingReference) setReferences(prev => prev.map(old => old.id === r.id ? r : old)); else setReferences(prev => [...prev, r]); setEditingReference(null); navigate('references'); }} onAddType={(t) => setRefTypes(prev => [...prev, t])} onCancel={() => { navigate('references'); setEditingReference(null); }} initialData={editingReference} />}
          {currentView === 'users' && <UserList users={users} onEdit={(u) => { setEditingUser(u); navigate('create-user'); }} onDelete={(id) => setUsers(prev => prev.filter(u => u.id !== id))} onCreate={() => navigate('create-user')} />}
          {currentView === 'create-user' && <UserForm onSave={(u) => { if (editingUser) setUsers(prev => prev.map(old => old.id === u.id ? u : old)); else setUsers(prev => [u, ...prev]); setEditingUser(null); navigate('users'); }} onCancel={() => { navigate('users'); setEditingUser(null); }} initialData={editingUser} />}
          {currentView === 'reports' && <ReportsView shipments={shipments} sales={sales} transfers={transfers} />}
          {currentView === 'settings' && <SettingsView apiUrl={apiUrl} setApiUrl={(url) => { setApiUrl(url); localStorage.setItem('nexus_api_url', url); }} onClearData={() => { if(confirm("DANGER: This will wipe all local records. Are you sure?")) { localStorage.removeItem('nexus_bms_data_v13'); window.location.reload(); } }} />}
        </main>
      </div>
    </div>
  );
};

export default App;
