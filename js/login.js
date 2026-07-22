// ==========================================
// GradeX - Login Module (Standalone - Client Side)
// ==========================================

// Pre-defined accounts (matching database credentials)
const ACCOUNTS = [
    {
        name: 'Admin User',
        email: 'admin@gradex.com',
        password: 'admin123',
        role: 'admin',
        avatar: 'A'
    },
    {
        name: 'Dr. Sarah Johnson',
        email: 'teacher@gradex.com',
        password: 'teacher123',
        role: 'teacher',
        avatar: 'S'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const existingUser = localStorage.getItem('gradexUser');
    if (existingUser) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    initializeLogin();
});

function initializeLogin() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) {
            closeModal();
        }
    });
    
    // Password visibility toggle
    initializePasswordToggle();
}

function initializePasswordToggle() {
    const toggleBtn = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    
    if (!toggleBtn || !passwordInput) return;
    
    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }
        
        toggleBtn.setAttribute('aria-label', 
            isPassword ? 'Hide password' : 'Show password'
        );
    });
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    // Show loading state
    const btn = document.querySelector('.btn-login');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    btn.disabled = true;
    
    // Simulate network delay for realistic UX
    setTimeout(() => {
        // Find matching account
        const account = ACCOUNTS.find(a => a.email === email && a.password === password);
        
        if (account) {
            const user = {
                name: account.name,
                email: account.email,
                role: account.role,
                avatar: account.avatar
            };
            
            localStorage.setItem('gradexUser', JSON.stringify(user));
            showToast(`Welcome back, ${user.name}!`, 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            showToast('Invalid email or password!', 'error');
        }
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 600);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3500);
}

