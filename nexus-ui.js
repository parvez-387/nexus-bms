
/**
 * NexusBMS UI Handler
 * Injects shared Sidebar and Navbar into all pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    if (!nexus.currentUser) return;
    
    injectSidebar();
    injectNavbar();
    setupTheme();
    
    // Auto-active link
    const path = window.location.pathname.split('/').pop() || 'dashboard.html';
    const activeLink = document.querySelector(`.nav-link[href*="${path}"]`);
    if (activeLink) activeLink.classList.add('active');
});

function injectSidebar() {
    const sidebarHTML = `
        <aside id="sidebar" class="sidebar">
            <div class="p-4 d-flex align-items-center gap-3 border-bottom">
                <div class="sidebar-logo">N</div>
                <span class="fw-bold fs-5">NexusBMS</span>
            </div>
            <nav class="p-3">
                <a href="dashboard.html" class="nav-link"><i class="fas fa-th-large me-3"></i>Dashboard</a>
                <div class="small fw-bold text-muted text-uppercase mt-4 mb-2 px-3">Operations</div>
                <a href="logistics.html" class="nav-link"><i class="fas fa-ship me-3"></i>Logistics</a>
                <a href="inventory.html" class="nav-link"><i class="fas fa-warehouse me-3"></i>Inventory</a>
                <a href="revenue.html" class="nav-link"><i class="fas fa-chart-line me-3"></i>Revenue</a>
                <div class="mt-auto pt-4 border-top">
                    <a href="settings.html" class="nav-link"><i class="fas fa-cog me-3"></i>Settings</a>
                    <button class="nav-link w-100 border-0 text-danger bg-transparent" onclick="nexus.logout()">
                        <i class="fas fa-sign-out-alt me-3"></i>Logout
                    </button>
                </div>
            </nav>
        </aside>
    `;
    const container = document.getElementById('sidebar-container');
    if (container) container.innerHTML = sidebarHTML;
}

function injectNavbar() {
    const navbarHTML = `
        <header class="navbar-sticky d-flex align-items-center justify-content-between px-4">
            <div class="d-flex align-items-center gap-3">
                <h5 class="fw-bold mb-0" id="page-title">Nexus Hub</h5>
                <span id="sync-pill" class="sync-pill"><i class="fas fa-cloud me-2"></i>Synced</span>
            </div>
            <div class="d-flex align-items-center gap-3">
                <button id="theme-btn" class="btn btn-link text-muted"><i class="fas fa-moon"></i></button>
                <div class="text-end d-none d-md-block">
                    <p class="fw-bold mb-0 small">${nexus.currentUser.name}</p>
                    <p class="text-muted mb-0 extra-small text-uppercase">${nexus.currentUser.role}</p>
                </div>
            </div>
        </header>
    `;
    const container = document.getElementById('navbar-container');
    if (container) container.innerHTML = navbarHTML;

    // Listen for sync events
    document.addEventListener('nexus-sync', (e) => {
        const pill = document.getElementById('sync-pill');
        if (!pill) return;
        pill.className = `sync-pill ${e.detail}`;
        pill.innerHTML = `<i class="fas fa-cloud me-2"></i> ${e.detail === 'loading' ? 'Syncing...' : 'Synced'}`;
    });
}

function setupTheme() {
    const isDark = localStorage.getItem('nexus_dark') === 'true';
    if (isDark) document.body.classList.add('dark-mode');

    document.addEventListener('click', (e) => {
        if (e.target.closest('#theme-btn')) {
            const dark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('nexus_dark', dark);
        }
    });
}
