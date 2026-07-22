// ==========================================
// GradeX - Login Module (Standalone)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeLogin();
});

function initializeLogin() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) {
            closeModal();
        }
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
    
    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('gradexUser', JSON.stringify(data.user));
            showToast(`Welcome back, ${data.user.name}!`, 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        } else {
            showToast(data.message || 'Invalid email or password!', 'error');
        }
    })
    .catch(err => {
        console.error('Login error:', err);
        showToast('Unable to connect to server. Please try again.', 'error');
    })
    .finally(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
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

