/**
 * NexusBMS Core Engine
 * Manages State, Routing, Forms, and Synchronization
 */

const INITIAL_STATE = {
    shipments: [
        { id: '1', name: "Saudi Ramadan Batch", date: "2024-01-15", receivingWarehouse: "Dhaka Warehouse", paymentMethod: "Cash", status: 'completed', products: [{ id: 'p1', name: 'Ajwa', qty: 500, rate: 850, amount: 425000, remarks: 'High Quality' }], costs: [{ id: 'c1', category: 'Transport', amount: 15000, remarks: 'Sea Freight' }], notes: "First batch", totalProfit: 410000 }
    ],
    transfers: [
        { id: 't1', productName: 'Ajwa', qty: 100, fromLocation: 'Chittagong Port', toLocation: 'Dhaka Warehouse', date: '2024-02-20', transportCost: 5500, paymentMethod: 'Cash', status: 'arrived', notes: 'Urgent replenishment' }
    ],
    sales: [],
    expenses: [],
    products: [
        { id: '1', name: 'Ajwa', category: 'Premium Dates', baseRate: 850, unit: 'kg', description: 'Premium Saudi Ajwa' },
        { id: '2', name: 'Safawi', category: 'Premium Dates', baseRate: 650, unit: 'kg', description: 'Soft and dark' }
    ],
    references: [
        { id: 'L1', type: 'location', label: 'Dhaka Warehouse' },
        { id: 'L2', type: 'location', label: 'Chittagong Port' },
        { id: 'PC1', type: 'product-category', label: 'Premium Dates' },
        { id: 'PC2', type: 'product-category', label: 'Regular Dates' },
        { id: 'EC1', type: 'expense-category', label: 'Staff Salary' },
        { id: 'CC1', type: 'cost-category', label: 'Transport' },
        { id: 'W1', type: 'payment-method', label: 'Cash' },
        { id: 'W2', type: 'payment-method', label: 'Bank Account' }
    ],
    users: [{ id: 'u1', name: 'Super Admin', email: 'admin@nexus.com', password: 'admin123', role: 'admin', status: 'active', permissions: ['all'], createdAt: new Date().toISOString() }],
    activities: [{ id: '1', title: 'System Initialized', description: 'State loaded successfully', time: 'Just now', type: 'inventory' }],
    currentUser: null,
    apiUrl: localStorage.getItem('nexus_api_url') || ""
};

class NexusApp {
    constructor() {
        this.state = this.loadLocal();
        this.currentView = 'dashboard';
        this.syncStatus = 'idle';
        this.init();
    }

    init() {
        // Auth Check
        const session = localStorage.getItem('nexus_session');
        if (session) {
            const user = this.state.users.find(u => u.id === session);
            if (user) this.state.currentUser = user;
        }

        this.renderAuth();
        this.setupEventListeners();
        this.updateSyncUI();
        if (this.state.apiUrl) this.fetchCloud();
    }

    loadLocal() {
        const saved = localStorage.getItem('nexus_bms_data_v13');
        return saved ? JSON.parse(saved) : INITIAL_STATE;
    }

    save() {
        localStorage.setItem('nexus_bms_data_v13', JSON.stringify(this.state));
        this.triggerSync();
    }

    async triggerSync() {
        if (!this.state.apiUrl || !this.state.currentUser) return;
        this.syncStatus = 'loading';
        this.updateSyncUI();

        try {
            await fetch(this.state.apiUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(this.state)
            });
            this.syncStatus = 'success';
        } catch (e) {
            this.syncStatus = 'error';
        }
        setTimeout(() => { this.syncStatus = 'idle'; this.updateSyncUI(); }, 3000);
    }

    async fetchCloud() {
        if (!this.state.apiUrl) return;
        try {
            const res = await fetch(this.state.apiUrl);
            const cloudData = await res.json();
            if (cloudData && typeof cloudData === 'object') {
                Object.assign(this.state, cloudData);
                this.render();
            }
        } catch (e) { console.error("Cloud fetch failed", e); }
    }

    // --- UI RENDERING ---

    renderAuth() {
        if (!this.state.currentUser) {
            document.getElementById('login-screen').classList.remove('d-none');
            document.getElementById('main-app').classList.add('d-none');
        } else {
            document.getElementById('login-screen').classList.add('d-none');
            document.getElementById('main-app').classList.remove('d-none');
            document.getElementById('nav-user-name').innerText = this.state.currentUser.name;
            document.getElementById('nav-user-role').innerText = this.state.currentUser.role;
            this.navigate(this.currentView);
        }
    }

    navigate(view) {
        this.currentView = view;
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-view="${view}"]`);
        if (activeLink) activeLink.classList.add('active');

        this.renderView();
        window.scrollTo(0, 0);
    }

    renderView() {
        const viewport = document.getElementById('viewport');
        const title = document.getElementById('view-title');
        viewport.innerHTML = '';

        switch(this.currentView) {
            case 'dashboard':
                title.innerText = "Dashboard Overview";
                this.renderDashboard(viewport);
                break;
            case 'shipments':
                title.innerText = "Logistics Records";
                this.renderShipmentList(viewport);
                break;
            case 'create-shipment':
                title.innerText = "New Logistics Order";
                this.renderShipmentForm(viewport);
                break;
            case 'inventory':
                title.innerText = "Live Warehousing";
                this.renderInventory(viewport);
                break;
            case 'sales':
                title.innerText = "Sales Ledger";
                this.renderSalesList(viewport);
                break;
            case 'create-sale':
                title.innerText = "New Sales Invoice";
                this.renderSaleForm(viewport);
                break;
            case 'expenses':
                title.innerText = "Expense Log";
                this.renderExpenseList(viewport);
                break;
            case 'products':
                title.innerText = "SKU Catalog";
                this.renderProductList(viewport);
                break;
            case 'settings':
                title.innerText = "System Configuration";
                this.renderSettings(viewport);
                break;
            default:
                viewport.innerHTML = `<div class="alert alert-info">Module <b>${this.currentView}</b> is loaded. Feature coming in next refresh.</div>`;
        }
    }

    // --- VIEW GENERATORS ---

    renderDashboard(el) {
        const totalSales = this.state.shipments.reduce((sum, s) => sum + s.totalProfit, 0);
        const activeTransfers = this.state.transfers.filter(t => t.status === 'in-transit').length;
        
        el.innerHTML = `
            <div class="row g-4 mb-5">
                <div class="col-md-3">
                    <div class="stat-card shadow-sm">
                        <div class="d-flex justify-content-between mb-3">
                            <div class="icon-box bg-primary text-white"><i class="fas fa-wallet"></i></div>
                            <span class="badge bg-success-subtle text-success">+12%</span>
                        </div>
                        <p class="small text-muted text-uppercase fw-bold tracking-widest mb-0">Total Valuation</p>
                        <h3 class="fw-bold mb-0">৳${totalSales.toLocaleString()}</h3>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card shadow-sm">
                        <div class="d-flex justify-content-between mb-3">
                            <div class="icon-box bg-info text-white"><i class="fas fa-truck-fast"></i></div>
                        </div>
                        <p class="small text-muted text-uppercase fw-bold tracking-widest mb-0">Active Moves</p>
                        <h3 class="fw-bold mb-0">${activeTransfers}</h3>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div class="card-header bg-white p-4 border-0 d-flex justify-content-between">
                            <h5 class="fw-bold mb-0">Aggregated Stock</h5>
                            <button class="btn btn-sm btn-link text-primary text-decoration-none fw-bold" onclick="nexus.navigate('inventory')">View Matrix</button>
                        </div>
                        <div class="table-responsive">
                            <table class="table mb-0">
                                <thead>
                                    <tr>
                                        <th class="ps-4">Item Name</th>
                                        <th class="text-center">Available</th>
                                        <th class="text-end pe-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.state.products.map(p => {
                                        const qty = this.calculateStock(p.name);
                                        return `
                                            <tr>
                                                <td class="ps-4 fw-bold">${p.name}</td>
                                                <td class="text-center font-monospace">${qty} kg</td>
                                                <td class="text-end pe-4">
                                                    <span class="badge ${qty < 500 ? 'bg-danger' : 'bg-success'} rounded-pill extra-small">${qty < 500 ? 'LOW' : 'STABLE'}</span>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <h5 class="fw-bold mb-3">Activity Stream</h5>
                    <div class="activity-list">
                        ${this.state.activities.map(a => `
                            <div class="d-flex gap-3 mb-4">
                                <div class="activity-icon small shadow-sm"><i class="fas fa-circle text-primary"></i></div>
                                <div>
                                    <p class="fw-bold mb-0 small">${a.title}</p>
                                    <p class="text-muted extra-small mb-0">${a.description}</p>
                                    <p class="extra-small text-primary fw-bold mt-1">${a.time}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderShipmentList(el) {
        el.innerHTML = `
            <div class="card border-0 shadow-sm rounded-4">
                <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
                    <h5 class="fw-bold mb-0">Logistics Repository</h5>
                    <button class="btn btn-primary btn-sm px-3 rounded-pill fw-bold" onclick="nexus.navigate('create-shipment')">Add Record</button>
                </div>
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th class="ps-4">Batch Ref</th>
                                <th>Warehouse</th>
                                <th>Date</th>
                                <th class="text-end">Valuation</th>
                                <th class="text-center">Status</th>
                                <th class="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.state.shipments.map(s => `
                                <tr>
                                    <td class="ps-4">
                                        <div class="fw-bold">${s.name}</div>
                                        <div class="extra-small text-muted text-uppercase tracking-widest">ID: ${s.id}</div>
                                    </td>
                                    <td><span class="small fw-medium"><i class="fas fa-map-pin text-primary me-1"></i> ${s.receivingWarehouse}</span></td>
                                    <td><span class="small">${s.date}</span></td>
                                    <td class="text-end fw-bold">৳${s.totalProfit.toLocaleString()}</td>
                                    <td class="text-center">
                                        <span class="badge rounded-pill bg-primary-subtle text-primary text-uppercase extra-small">${s.status}</span>
                                    </td>
                                    <td class="text-end pe-4">
                                        <button class="btn btn-sm btn-light text-primary"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-sm btn-light text-danger" onclick="nexus.deleteShipment('${s.id}')"><i class="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderSettings(el) {
        el.innerHTML = `
            <div class="card border-0 shadow-sm rounded-4 p-5 max-w-lg mx-auto">
                <div class="text-center mb-4">
                    <div class="icon-box bg-primary text-white mx-auto mb-3"><i class="fas fa-cloud"></i></div>
                    <h4 class="fw-bold">Enterprise Cloud Sync</h4>
                    <p class="text-muted small">Connect your system to Google Sheets for real-time reporting.</p>
                </div>
                <div class="mb-4">
                    <label class="small fw-bold text-muted text-uppercase mb-2">Web App URL</label>
                    <input type="text" id="api-url-input" class="form-control rounded-3" value="${this.state.apiUrl}" placeholder="https://script.google.com/...">
                </div>
                <div class="d-grid gap-2">
                    <button class="btn btn-primary py-2 fw-bold" onclick="nexus.saveApiUrl()">Save Configuration</button>
                    <button class="btn btn-outline-danger py-2 fw-bold" onclick="nexus.clearAllData()">Wipe Local Database</button>
                </div>
            </div>
        `;
    }

    // --- LOGIC HELPERS ---

    calculateStock(productName) {
        const incoming = this.state.shipments.reduce((sum, s) => {
            const p = s.products.find(prod => prod.name === productName);
            return sum + (p ? p.qty : 0);
        }, 0);
        const movedOut = this.state.transfers.filter(t => t.productName === productName).reduce((sum, t) => sum + t.qty, 0);
        return incoming - movedOut; // Simplified logic as per standard BMS requirements
    }

    deleteShipment(id) {
        if (!confirm('Permanently delete this record?')) return;
        this.state.shipments = this.state.shipments.filter(s => s.id !== id);
        this.save();
        this.renderView();
    }

    saveApiUrl() {
        const url = document.getElementById('api-url-input').value;
        this.state.apiUrl = url;
        localStorage.setItem('nexus_api_url', url);
        this.save();
        alert('Cloud configuration updated.');
        this.fetchCloud();
    }

    clearAllData() {
        if (!confirm('DANGER: This will delete everything. Proceed?')) return;
        localStorage.removeItem('nexus_bms_data_v13');
        location.reload();
    }

    updateSyncUI() {
        const pill = document.getElementById('sync-indicator');
        if (!pill) return;
        pill.className = `sync-pill ${this.syncStatus}`;
        pill.querySelector('span').innerText = this.syncStatus === 'loading' ? 'Syncing...' : this.syncStatus === 'success' ? 'Cloud Synced' : this.syncStatus === 'error' ? 'Sync Error' : 'Local Only';
    }

    // --- INTERACTION ---

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link[data-view]').forEach(link => {
            link.addEventListener('click', (e) => this.navigate(e.currentTarget.dataset.view));
        });

        // Sidebar Toggles
        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        document.getElementById('mobile-sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('mobile-open');
        });

        // Theme Toggle
        document.getElementById('theme-toggle').addEventListener('click', (e) => {
            document.body.classList.toggle('dark-mode');
            const icon = e.currentTarget.querySelector('i');
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
        });

        // Login Logic
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            const user = this.state.users.find(u => u.email === email && u.password === pass);
            
            if (user) {
                this.state.currentUser = user;
                localStorage.setItem('nexus_session', user.id);
                this.renderAuth();
            } else {
                const err = document.getElementById('login-error');
                err.innerText = "Invalid security credentials.";
                err.classList.remove('d-none');
            }
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.state.currentUser = null;
            localStorage.removeItem('nexus_session');
            this.renderAuth();
        });
    }
}

// Start Engine
const nexus = new NexusApp();
