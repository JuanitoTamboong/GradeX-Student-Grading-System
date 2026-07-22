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
    
    const users = [
        { id: 1, name: 'Admin User', email: 'admin@gradex.com', password: 'admin123', role: 'admin', avatar: 'A' },
        { id: 2, name: 'Dr. Sarah Johnson', email: 'teacher@gradex.com', password: 'teacher123', role: 'teacher', avatar: 'S' },
        { id: 3, name: 'John Doe', email: 'student@gradex.com', password: 'student123', role: 'student', avatar: 'J' }
    ];
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('gradexUser', JSON.stringify(user));
        showToast(`Welcome back, ${user.name}!`, 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 800);
    } else {
        showToast('Invalid email or password!', 'error');
    }
}

function fillCredentials(email, password) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
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

