
/**
 * NexusBMS Core Engine (MPA Version)
 * Shared between all pages.
 */

const DEFAULT_STATE = {
    shipments: [
        { id: '1', name: "Saudi Ramadan Batch", date: "2024-01-15", receivingWarehouse: "Dhaka Warehouse", paymentMethod: "Cash", status: 'completed', products: [{ id: 'p1', name: 'Ajwa', qty: 500, rate: 850, amount: 425000 }], costs: [{ id: 'c1', category: 'Transport', amount: 15000 }], totalProfit: 410000 }
    ],
    sales: [],
    products: [
        { id: '1', name: 'Ajwa', category: 'Premium Dates', baseRate: 850, unit: 'kg' },
        { id: '2', name: 'Safawi', category: 'Premium Dates', baseRate: 650, unit: 'kg' }
    ],
    references: [
        { type: 'location', label: 'Dhaka Warehouse' },
        { type: 'location', label: 'Chittagong Port' },
        { type: 'payment-method', label: 'Cash' },
        { type: 'payment-method', label: 'Bank Account' }
    ],
    users: [{ id: 'u1', name: 'Super Admin', email: 'admin@nexus.com', password: 'admin123', role: 'admin' }],
    apiUrl: localStorage.getItem('nexus_api_url') || ""
};

class NexusCore {
    constructor() {
        this.state = this.load();
        this.currentUser = this.checkAuth();
    }

    load() {
        const saved = localStorage.getItem('nexus_bms_data_v13');
        return saved ? JSON.parse(saved) : DEFAULT_STATE;
    }

    save() {
        localStorage.setItem('nexus_bms_data_v13', JSON.stringify(this.state));
        this.sync();
    }

    checkAuth() {
        const sessionId = localStorage.getItem('nexus_session');
        if (!sessionId && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
            return null;
        }
        return this.state.users.find(u => u.id === sessionId);
    }

    async sync() {
        if (!this.state.apiUrl) return;
        try {
            document.dispatchEvent(new CustomEvent('nexus-sync', { detail: 'loading' }));
            await fetch(this.state.apiUrl, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(this.state)
            });
            document.dispatchEvent(new CustomEvent('nexus-sync', { detail: 'success' }));
        } catch (e) {
            document.dispatchEvent(new CustomEvent('nexus-sync', { detail: 'error' }));
        }
    }

    logout() {
        localStorage.removeItem('nexus_session');
        window.location.href = 'index.html';
    }
}

const nexus = new NexusCore();
