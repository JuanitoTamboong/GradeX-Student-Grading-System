// ==========================================
// GradeX - Application Logic
// ==========================================

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load saved data from localStorage
    loadFromStorage();
    
    // Setup login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Setup navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });
    
    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Setup menu toggle for mobile
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
    });
    
    // Setup global search
    document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);
    
    // Close modal on overlay click
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) {
            closeModal();
        }
    });
    
    // Load settings
    loadSettings();
}

// ==========================================
// LOCAL STORAGE
// ==========================================
function saveToStorage() {
    try {
        localStorage.setItem('gradexStudents', JSON.stringify(GradeX.students));
        localStorage.setItem('gradexSubjects', JSON.stringify(GradeX.subjects));
        localStorage.setItem('gradexGrades', JSON.stringify(GradeX.grades));
        localStorage.setItem('gradexSettings', JSON.stringify(GradeX.state.settings));
        localStorage.setItem('gradexWeights', JSON.stringify(GradeX.state.gradeWeights));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadFromStorage() {
    try {
        const students = localStorage.getItem('gradexStudents');
        const subjects = localStorage.getItem('gradexSubjects');
        const grades = localStorage.getItem('gradexGrades');
        const settings = localStorage.getItem('gradexSettings');
        const weights = localStorage.getItem('gradexWeights');
        
        if (students) GradeX.students = JSON.parse(students);
        if (subjects) GradeX.subjects = JSON.parse(subjects);
        if (grades) GradeX.grades = JSON.parse(grades);
        if (settings) GradeX.state.settings = JSON.parse(settings);
        if (weights) GradeX.state.gradeWeights = JSON.parse(weights);
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
    }
}

// ==========================================
// AUTHENTICATION
// ==========================================
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const user = GradeX.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        GradeX.state.currentUser = user;
        showApp(user);
        showToast(`Welcome back, ${user.name}!`, 'success');
    } else {
        showToast('Invalid email or password!', 'error');
    }
}

function handleLogout() {
    GradeX.state.currentUser = null;
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('app').classList.remove('active');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    showToast('Logged out successfully', 'info');
}

function showApp(user) {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('app').classList.add('active');
    
    // Update user info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = 
        user.role === 'admin' ? 'Administrator' : 
        user.role === 'teacher' ? 'Teacher' : 'Student';
    document.getElementById('userAvatar').textContent = user.avatar || user.name.charAt(0);
    
    // Setup role-based visibility
    setupRoleBasedAccess(user.role);
    
    // Navigate to dashboard
    navigateTo('dashboard');
}

function fillCredentials(email, password) {
    document.getElementById('email').value = email;
    document.getElementById('password').value = password;
}

// ==========================================
// ROLE-BASED ACCESS
// ==========================================
function setupRoleBasedAccess(role) {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const page = item.dataset.page;
        
        if (role === 'student') {
            // Students can only see Dashboard, Grades, Reports
            if (page === 'students' || page === 'subjects' || page === 'settings') {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        } else {
            item.style.display = 'flex';
        }
    });
}

// ==========================================
// NAVIGATION
// ==========================================
function navigateTo(page) {
    GradeX.state.currentPage = page;
    
    // Update sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Update page content
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`page-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    
    // Load page data
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'students':
            loadStudents();
            break;
        case 'grades':
            loadGrades();
            break;
        case 'subjects':
            loadSubjects();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// ==========================================
// DASHBOARD
// ==========================================
function loadDashboard() {
    const stats = calculateDashboardStats();
    
    // Update stats
    const statsHtml = `
        <div class="stat-card">
            <div class="stat-icon blue">
                <i class="fas fa-user-graduate"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.totalStudents}</h3>
                <p>Total Students</p>
                <span class="stat-change up">
                    <i class="fas fa-arrow-up"></i> ${stats.studentChange}%
                </span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green">
                <i class="fas fa-book"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.totalSubjects}</h3>
                <p>Active Subjects</p>
                <span class="stat-change up">
                    <i class="fas fa-arrow-up"></i> ${stats.subjectChange}%
                </span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon yellow">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.totalGrades}</h3>
                <p>Grades Computed</p>
                <span class="stat-change ${stats.gradeChange >= 0 ? 'up' : 'down'}">
                    <i class="fas fa-arrow-${stats.gradeChange >= 0 ? 'up' : 'down'}"></i> ${Math.abs(stats.gradeChange)}%
                </span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon purple">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.passingRate}%</h3>
                <p>Passing Rate</p>
                <span class="stat-change up">
                    <i class="fas fa-arrow-up"></i> ${stats.passingChange}%
                </span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon cyan">
                <i class="fas fa-chart-bar"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.averageGrade}%</h3>
                <p>Average Grade</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon red">
                <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
                <h3>${stats.activeTeachers}</h3>
                <p>Active Teachers</p>
            </div>
        </div>
    `;
    
    document.getElementById('dashboardStats').innerHTML = statsHtml;
    
    // Load recent grades
    loadRecentGrades();
    
    // Load performance chart
    loadPerformanceChart();
}

function calculateDashboardStats() {
    const grades = GradeX.getAllGradesWithDetails();
    const passingGrades = grades.filter(g => g.total >= GradeX.state.settings.passingGrade);
    
    return {
        totalStudents: GradeX.students.length,
        studentChange: 12,
        totalSubjects: GradeX.subjects.length,
        subjectChange: 8,
        totalGrades: grades.length,
        gradeChange: 15,
        passingRate: grades.length > 0 ? Math.round((passingGrades.length / grades.length) * 100) : 0,
        passingChange: 5,
        averageGrade: grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.total, 0) / grades.length) : 0,
        activeTeachers: 6
    };
}

function loadRecentGrades() {
    const grades = GradeX.getAllGradesWithDetails();
    const recent = grades.slice(0, 8);
    
    const tbody = document.getElementById('recentGradesBody');
    tbody.innerHTML = recent.map(g => `
        <tr>
            <td><strong>${g.studentName}</strong></td>
            <td>${g.subjectName}</td>
            <td class="${GradeX.getGradeClass(g.total)}">${g.total}% (${g.letterGrade})</td>
            <td><span class="status-badge ${g.status.class}">${g.status.text}</span></td>
        </tr>
    `).join('');
}

function loadPerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.performanceChartInstance) {
        window.performanceChartInstance.destroy();
    }
    
    // Aggregate grades by subject
    const subjectAverages = {};
    GradeX.getAllGradesWithDetails().forEach(g => {
        if (!subjectAverages[g.subjectName]) {
            subjectAverages[g.subjectName] = { total: 0, count: 0 };
        }
        subjectAverages[g.subjectName].total += g.total;
        subjectAverages[g.subjectName].count++;
    });
    
    const labels = Object.keys(subjectAverages);
    const data = labels.map(l => Math.round(subjectAverages[l].total / subjectAverages[l].count));
    const colors = data.map(v => {
        if (v >= 90) return '#10b981';
        if (v >= 80) return '#3b82f6';
        if (v >= 70) return '#f59e0b';
        return '#ef4444';
    });
    
    window.performanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Grade (%)',
                data: data,
                backgroundColor: colors,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ==========================================
// STUDENTS
// ==========================================
function loadStudents() {
    const tbody = document.getElementById('studentsTableBody');
    
    tbody.innerHTML = GradeX.students.map(s => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.year}</td>
            <td>${s.course}</td>
            <td>${s.gpa.toFixed(2)}</td>
            <td><span class="status-badge ${s.status}">${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span></td>
            <td>
                <button class="btn-icon-sm edit" title="Edit" onclick="editStudent('${s.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon-sm delete" title="Delete" onclick="deleteStudent('${s.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterStudents() {
    const search = document.getElementById('studentSearch').value.toLowerCase();
    const yearFilter = document.getElementById('studentFilter').value;
    
    const filtered = GradeX.students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search) || 
                             s.id.toLowerCase().includes(search) ||
                             s.email.toLowerCase().includes(search);
        const matchesYear = yearFilter === 'all' || s.year === yearFilter;
        return matchesSearch && matchesYear;
    });
    
    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = filtered.map(s => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.year}</td>
            <td>${s.course}</td>
            <td>${s.gpa.toFixed(2)}</td>
            <td><span class="status-badge ${s.status}">${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span></td>
            <td>
                <button class="btn-icon-sm edit" title="Edit" onclick="editStudent('${s.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon-sm delete" title="Delete" onclick="deleteStudent('${s.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showAddStudentModal() {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'Add New Student';
    
    document.getElementById('modalBody').innerHTML = `
        <form id="studentForm" onsubmit="saveStudent(event)">
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" id="studentName" placeholder="Enter full name" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="studentEmail" placeholder="Enter email" required>
            </div>
            <div class="form-group">
                <label>Year Level</label>
                <select id="studentYear" required>
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                </select>
            </div>
            <div class="form-group">
                <label>Course</label>
                <select id="studentCourse" required>
                    <option value="">Select course</option>
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Information Technology">BS Information Technology</option>
                    <option value="BS Information Systems">BS Information Systems</option>
                    <option value="BS Computer Engineering">BS Computer Engineering</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">
                <i class="fas fa-save"></i> Save Student
            </button>
        </form>
    `;
    
    document.getElementById('modalOverlay').classList.add('active');
}

function saveStudent(e) {
    e.preventDefault();
    
    const student = {
        id: GradeX.generateId('STU'),
        name: document.getElementById('studentName').value.trim(),
        email: document.getElementById('studentEmail').value.trim(),
        year: document.getElementById('studentYear').value,
        course: document.getElementById('studentCourse').value,
        gpa: 0,
        status: 'active'
    };
    
    GradeX.students.push(student);
    saveToStorage();
    loadStudents();
    closeModal();
    showToast('Student added successfully!', 'success');
}

function editStudent(id) {
    const student = GradeX.students.find(s => s.id === id);
    if (!student) return;
    
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'Edit Student';
    
    document.getElementById('modalBody').innerHTML = `
        <form id="studentForm" onsubmit="updateStudent(event, '${id}')">
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" id="studentName" value="${student.name}" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="studentEmail" value="${student.email}" required>
            </div>
            <div class="form-group">
                <label>Year Level</label>
                <select id="studentYear" required>
                    <option value="1st Year" ${student.year === '1st Year' ? 'selected' : ''}>1st Year</option>
                    <option value="2nd Year" ${student.year === '2nd Year' ? 'selected' : ''}>2nd Year</option>
                    <option value="3rd Year" ${student.year === '3rd Year' ? 'selected' : ''}>3rd Year</option>
                    <option value="4th Year" ${student.year === '4th Year' ? 'selected' : ''}>4th Year</option>
                </select>
            </div>
            <div class="form-group">
                <label>Course</label>
                <select id="studentCourse" required>
                    <option value="BS Computer Science" ${student.course === 'BS Computer Science' ? 'selected' : ''}>BS Computer Science</option>
                    <option value="BS Information Technology" ${student.course === 'BS Information Technology' ? 'selected' : ''}>BS Information Technology</option>
                    <option value="BS Information Systems" ${student.course === 'BS Information Systems' ? 'selected' : ''}>BS Information Systems</option>
                    <option value="BS Computer Engineering" ${student.course === 'BS Computer Engineering' ? 'selected' : ''}>BS Computer Engineering</option>
                </select>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="studentStatus">
                    <option value="active" ${student.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${student.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">
                <i class="fas fa-save"></i> Update Student
            </button>
        </form>
    `;
    
    document.getElementById('modalOverlay').classList.add('active');
}

function updateStudent(e, id) {
    e.preventDefault();
    
    const student = GradeX.students.find(s => s.id === id);
    if (!student) return;
    
    student.name = document.getElementById('studentName').value.trim();
    student.email = document.getElementById('studentEmail').value.trim();
    student.year = document.getElementById('studentYear').value;
    student.course = document.getElementById('studentCourse').value;
    student.status = document.getElementById('studentStatus').value;
    
    saveToStorage();
    loadStudents();
    closeModal();
    showToast('Student updated successfully!', 'success');
}

function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    GradeX.students = GradeX.students.filter(s => s.id !== id);
    GradeX.grades = GradeX.grades.filter(g => g.studentId !== id);
    saveToStorage();
    loadStudents();
    showToast('Student deleted successfully', 'info');
}

// ==========================================
// GRADES
// ==========================================
function loadGrades() {
    const grades = GradeX.getAllGradesWithDetails();
    const tbody = document.getElementById('gradesTableBody');
    
    tbody.innerHTML = grades.map(g => `
        <tr>
            <td><strong>${g.studentName}</strong></td>
            <td>${g.subjectName}</td>
            <td>${g.quiz}</td>
            <td>${g.assignment}</td>
            <td>${g.project}</td>
            <td>${g.exam}</td>
            <td class="${GradeX.getGradeClass(g.total)}"><strong>${g.total}%</strong></td>
            <td>
                <span class="${GradeX.getGradeClass(g.total)}"><strong>${g.letterGrade}</strong></span>
                <br>
                <span class="status-badge ${g.status.class}">${g.status.text}</span>
            </td>
            <td>
                <button class="btn-icon-sm edit" title="Edit" onclick="editGrade('${g.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon-sm delete" title="Delete" onclick="deleteGrade('${g.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Populate subject filter
    const filterSelect = document.getElementById('gradeSubjectFilter');
    const currentValue = filterSelect.value;
    const subjects = [...new Set(grades.map(g => g.subjectName))];
    filterSelect.innerHTML = '<option value="all">All Subjects</option>' + 
        subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    filterSelect.value = currentValue;
}

function filterGrades() {
    const search = document.getElementById('gradeSearch').value.toLowerCase();
    const subjectFilter = document.getElementById('gradeSubjectFilter').value;
    
    const grades = GradeX.getAllGradesWithDetails();
    const filtered = grades.filter(g => {
        const matchesSearch = g.studentName.toLowerCase().includes(search) || 
                             g.subjectName.toLowerCase().includes(search);
        const matchesSubject = subjectFilter === 'all' || g.subjectName === subjectFilter;
        return matchesSearch && matchesSubject;
    });
    
    const tbody = document.getElementById('gradesTableBody');
    tbody.innerHTML = filtered.map(g => `
        <tr>
            <td><strong>${g.studentName}</strong></td>
            <td>${g.subjectName}</td>
            <td>${g.quiz}</td>
            <td>${g.assignment}</td>
            <td>${g.project}</td>
            <td>${g.exam}</td>
            <td class="${GradeX.getGradeClass(g.total)}"><strong>${g.total}%</strong></td>
            <td>
                <span class="${GradeX.getGradeClass(g.total)}"><strong>${g.letterGrade}</strong></span>
                <br>
                <span class="status-badge ${g.status.class}">${g.status.text}</span>
            </td>
            <td>
                <button class="btn-icon-sm edit" title="Edit" onclick="editGrade('${g.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon-sm delete" title="Delete" onclick="deleteGrade('${g.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showAddGradeModal() {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'Add New Grade';
    
    const studentOptions = GradeX.students.map(s => 
        `<option value="${s.id}">${s.name} (${s.id})</option>`
    ).join('');
    
    const subjectOptions = GradeX.subjects.map(s => 
        `<option value="${s.code}">${s.name} (${s.code})</option>`
    ).join('');
    
    document.getElementById('modalBody').innerHTML = `
        <form id="gradeForm" onsubmit="saveGrade(event)">
            <div class="form-group">
                <label>Student</label>
                <select id="gradeStudent" required>
                    <option value="">Select student</option>
                    ${studentOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Subject</label>
                <select id="gradeSubject" required>
                    <option value="">Select subject</option>
                    ${subjectOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Quiz Score (0-100)</label>
                <input type="number" id="gradeQuiz" min="0" max="100" placeholder="Enter quiz score" required>
            </div>
            <div class="form-group">
                <label>Assignment Score (0-100)</label>
                <input type="number" id="gradeAssignment" min="0" max="100" placeholder="Enter assignment score" required>
            </div>
            <div class="form-group">
                <label>Project Score (0-100)</label>
                <input type="number" id="gradeProject" min="0" max="100" placeholder="Enter project score" required>
            </div>
            <div class="form-group">
                <label>Exam Score (0-100)</label>
                <input type="number" id="gradeExam" min="0" max="100" placeholder="Enter exam score" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">
                <i class="fas fa-save"></i> Save Grade
            </button>
        </form>
    `;
    
    document.getElementById('modalOverlay').classList.add('active');
}

function saveGrade(e) {
    e.preventDefault();
    
    const grade = {
        id: GradeX.generateId('GRD'),
        studentId: document.getElementById('gradeStudent').value,
        subjectCode: document.getElementById('gradeSubject').value,
        quiz: parseInt(document.getElementById('gradeQuiz').value),
        assignment: parseInt(document.getElementById('gradeAssignment').value),
        project: parseInt(document.getElementById('gradeProject').value),
        exam: parseInt(document.getElementById('gradeExam').value)
    };
    
    // Check if grade already exists for this student+subject
    const exists = GradeX.grades.find(g => 
        g.studentId === grade.studentId && g.subjectCode === grade.subjectCode
    );
    
    if (exists) {
        showToast('Grade already exists for this student and subject!', 'warning');
        return;
    }
    
    GradeX.grades.push(grade);
    
    // Update student GPA
    const student = GradeX.getStudent(grade.studentId);
    if (student) {
        student.gpa = GradeX.calculateGPA(grade.studentId);
    }
    
    saveToStorage();
    loadGrades();
    closeModal();
    showToast('Grade added successfully!', 'success');
}

function editGrade(id) {
    const grade = GradeX.grades.find(g => g.id === id);
    if (!grade) return;
    
    const student = GradeX.getStudent(grade.studentId);
    const subject = GradeX.getSubject(grade.subjectCode);
    
    document.getElementById('modalTitle').textContent = 'Edit Grade';
    
    const studentOptions = GradeX.students.map(s => 
        `<option value="${s.id}" ${s.id === grade.studentId ? 'selected' : ''}>${s.name}</option>`
    ).join('');
    
    const subjectOptions = GradeX.subjects.map(s => 
        `<option value="${s.code}" ${s.code === grade.subjectCode ? 'selected' : ''}>${s.name}</option>`
    ).join('');
    
    document.getElementById('modalBody').innerHTML = `
        <form id="gradeForm" onsubmit="updateGrade(event, '${id}')">
            <div class="form-group">
                <label>Student</label>
                <select id="gradeStudent" required>
                    ${studentOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Subject</label>
                <select id="gradeSubject" required>
                    ${subjectOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Quiz Score</label>
                <input type="number" id="gradeQuiz" value="${grade.quiz}" min="0" max="100" required>
            </div>
            <div class="form-group">
                <label>Assignment Score</label>
                <input type="number" id="gradeAssignment" value="${grade.assignment}" min="0" max="100" required>
            </div>
            <div class="form-group">
                <label>Project Score</label>
                <input type="number" id="gradeProject" value="${grade.project}" min="0" max="100" required>
            </div>
            <div class="form-group">
                <label>Exam Score</label>
                <input type="number" id="gradeExam" value="${grade.exam}" min="0" max="100" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">
                <i class="fas fa-save"></i> Update Grade
            </button>
        </form>
    `;
    
    document.getElementById('modalOverlay').classList.add('active');
}

function updateGrade(e, id) {
    e.preventDefault();
    
    const grade = GradeX.grades.find(g => g.id === id);
    if (!grade) return;
    
    const oldStudentId = grade.studentId;
    
    grade.studentId = document.getElementById('gradeStudent').value;
    grade.subjectCode = document.getElementById('gradeSubject').value;
    grade.quiz = parseInt(document.getElementById('gradeQuiz').value);
    grade.assignment = parseInt(document.getElementById('gradeAssignment').value);
    grade.project = parseInt(document.getElementById('gradeProject').value);
    grade.exam = parseInt(document.getElementById('gradeExam').value);
    
    // Update GPAs for both old and new students
    const oldStudent = GradeX.getStudent(oldStudentId);
    if (oldStudent) oldStudent.gpa = GradeX.calculateGPA(oldStudentId);
    
    const newStudent = GradeX.getStudent(grade.studentId);
    if (newStudent && oldStudentId !== grade.studentId) {
        newStudent.gpa = GradeX.calculateGPA(grade.studentId);
    }
    
    saveToStorage();
    loadGrades();
    closeModal();
    showToast('Grade updated successfully!', 'success');
}

function deleteGrade(id) {
    if (!confirm('Are you sure you want to delete this grade?')) return;
    
    const grade = GradeX.grades.find(g => g.id === id);
    GradeX.grades = GradeX.grades.filter(g => g.id !== id);
    
    // Update student GPA
    if (grade) {
        const student = GradeX.getStudent(grade.studentId);
        if (student) {
            student.gpa = GradeX.calculateGPA(grade.studentId);
        }
    }
    
    saveToStorage();
    loadGrades();
    showToast('Grade deleted successfully', 'info');
}

function computeAllGrades() {
    const grades = GradeX.getAllGradesWithDetails();
    
    // Update all student GPAs
    GradeX.students.forEach(student => {
        student.gpa = GradeX.calculateGPA(student.id);
    });
    
    saveToStorage();
    loadGrades();
    showToast(`Computed ${grades.length} grades successfully!`, 'success');
}

// ==========================================
// SUBJECTS
// ==========================================
function loadSubjects() {
    const tbody = document.getElementById('subjectsTableBody');
    
    tbody.innerHTML = GradeX.subjects.map(s => `
        <tr>
            <td><strong>${s.code}</strong></td>
            <td>${s.name}</td>
            <td>${s.instructor}</td>
            <td>${s.credits}</td>
            <td>${s.students}</td>
            <td>
                <button class="btn-icon-sm edit" title="Edit" onclick="editSubject('${s.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon-sm delete" title="Delete" onclick="deleteSubject('${s.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function showAddSubjectModal() {
    document.getElementById('modalTitle').textContent = 'Add New Subject';
    
    document.getElementById('modalBody').innerHTML = `
        <form id="subjectForm" onsubmit="saveSubject(event)">
            <div class="form-group">
                <label>Subject Code</label>
                <input type="text" id="subjectCode" placeholder="e.g., CS101" required>
            </div>
            <div class="form-group">
                <label>Subject Name</label>
                <input type="text" id="subjectName" placeholder="Enter subject name" required>
            </div>
            <div class="form-group">
                <label>Instructor</label>
                <input type="text" id="subjectInstructor" placeholder="Enter instructor name" required>
            </div>
            <div class="form-group">
                <label>Credits</label>
                <input type="number" id="subjectCredits" min="1" max="6" placeholder="Enter credits" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">
                <i class="fas fa-save"></i> Save Subject
            </button>
        </form>
    `;
    
    document.getElementById('modalOverlay').classList.add('active');
}

function saveSubject(e) {
    e.preventDefault();
    
    const subject = {
        id: GradeX.generateId('SUB'),
        code: document.getElementById('subjectCode').value.trim().toUpperCase(),
        name: document.getElementById('subjectName').value.trim(),
        instructor: document.getElementById('subjectInstructor').value.trim(),
        credits: parseInt(document.getElementById('subjectCredits').value),
        students: 0
    };
    
    GradeX.subjects.push(subject);
    saveToStorage();
    loadSubjects();
    closeModal();
    showToast('Subject added successfully!', 'success');
}

function editSubject(id) {
    const subject = GradeX.subjects.find(s => s.id === id);
    if (!subject) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Subject';
    
    document.getElementById('modalBody').innerHTML = `
        <form id="subjectForm" onsubmit="updateSubject(event, '${id}')">
            <div class="form-group">
                <label>Subject Code</label>
                <input type="text" id="subjectCode" value="${subject.code}" required>
            </div>
            <div class="form-group">
                <label>Subject Name</label>
                <input type="text" id="subjectName" value="${subject.name}" required>
            </div>
            <div class="form-group">
                <label>Instructor</label>
                <input type="text" id="subjectInstructor" value="${subject.instructor}" required>
            </div>
            <div class="form-group">
                <label>Credits</label>
                <input type="number" id="subjectCredits" value="${subject.credits}" min="1" max="6" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;margin-top:8px;">
                <i class="fas fa-save"></i> Update Subject
            </button>
        </form>
    `;
    
    document.getElementById('modalOverlay').classList.add('active');
}

function updateSubject(e, id) {
    e.preventDefault();
    
    const subject = GradeX.subjects.find(s => s.id === id);
    if (!subject) return;
    
    subject.code = document.getElementById('subjectCode').value.trim().toUpperCase();
    subject.name = document.getElementById('subjectName').value.trim();
    subject.instructor = document.getElementById('subjectInstructor').value.trim();
    subject.credits = parseInt(document.getElementById('subjectCredits').value);
    
    saveToStorage();
    loadSubjects();
    closeModal();
    showToast('Subject updated successfully!', 'success');
}

function deleteSubject(id) {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    
    GradeX.subjects = GradeX.subjects.filter(s => s.id !== id);
    GradeX.grades = GradeX.grades.filter(g => g.subjectCode !== 
        GradeX.subjects.find(s => s.id === id)?.code);
    
    saveToStorage();
    loadSubjects();
    showToast('Subject deleted successfully', 'info');
}

// ==========================================
// REPORTS
// ==========================================
function loadReports() {
    document.getElementById('reportResult').style.display = 'none';
}

function generateReport(type) {
    const reportContent = document.getElementById('reportContent');
    const reportResult = document.getElementById('reportResult');
    
    let html = '';
    
    switch (type) {
        case 'class':
            html = generateClassReport();
            break;
        case 'student':
            html = generateStudentReportForm();
            break;
        case 'subject':
            html = generateSubjectReport();
            break;
        case 'summary':
            html = generateSummaryReport();
            break;
    }
    
    reportContent.innerHTML = html;
    reportResult.style.display = 'block';
    showToast('Report generated successfully!', 'success');
}

function generateClassReport() {
    const grades = GradeX.getAllGradesWithDetails();
    const subjects = [...new Set(grades.map(g => g.subjectName))];
    
    let html = `
        <div class="report-header" style="text-align:center;margin-bottom:20px;padding-bottom:20px;border-bottom:2px solid #e2e8f0;">
            <h2 style="font-size:20px;color:#1e293b;">${GradeX.state.settings.schoolName}</h2>
            <p style="color:#64748b;">Class Performance Report - Academic Year ${GradeX.state.settings.academicYear}</p>
            <p style="color:#64748b;font-size:13px;">Generated: ${new Date().toLocaleDateString()}</p>
        </div>
    `;
    
    subjects.forEach(subject => {
        const subjectGrades = grades.filter(g => g.subjectName === subject);
        const avg = Math.round(subjectGrades.reduce((sum, g) => sum + g.total, 0) / subjectGrades.length);
        const passed = subjectGrades.filter(g => g.total >= GradeX.state.settings.passingGrade).length;
        const failed = subjectGrades.length - passed;
        
        html += `
            <div style="margin-bottom:20px;padding:16px;background:#f8fafc;border-radius:8px;">
                <h3 style="display:flex;justify-content:space-between;margin-bottom:12px;">
                    <span>${subject}</span>
                    <span>Average: <strong>${avg}%</strong></span>
                </h3>
                <div style="display:flex;gap:16px;font-size:13px;">
                    <span>Passed: <strong style="color:#10b981;">${passed}</strong></span>
                    <span>Failed: <strong style="color:#ef4444;">${failed}</strong></span>
                    <span>Total: <strong>${subjectGrades.length}</strong></span>
                </div>
                <div style="margin-top:8px;">
                    <div class="progress-bar">
                        <div class="progress green" style="width:${(passed/subjectGrades.length)*100}%"></div>
                    </div>
                </div>
            </div>
        `;
    });
    
    return html;
}

function generateStudentReportForm() {
    const options = GradeX.students.map(s => 
        `<option value="${s.id}">${s.name} (${s.id})</option>`
    ).join('');
    
    return `
        <div style="margin-bottom:16px;">
            <div class="form-group">
                <label>Select Student</label>
                <select id="reportStudentSelect" onchange="showStudentReport(this.value)">
                    <option value="">-- Select a student --</option>
                    ${options}
                </select>
            </div>
        </div>
        <div id="studentReportResult">
            <p style="color:#64748b;text-align:center;padding:40px;">Select a student to view their transcript</p>
        </div>
    `;
}

function showStudentReport(studentId) {
    if (!studentId) return;
    
    const student = GradeX.getStudent(studentId);
    if (!student) return;
    
    const grades = GradeX.getStudentGrades(studentId);
    const gradeDetails = grades.map(g => {
        const subject = GradeX.getSubject(g.subjectCode);
        const total = GradeX.computeTotal(g);
        return { ...g, subjectName: subject?.name || 'Unknown', total };
    });
    
    const avg = gradeDetails.length > 0 
        ? Math.round(gradeDetails.reduce((sum, g) => sum + g.total, 0) / gradeDetails.length) 
        : 0;
    
    let html = `
        <div style="padding:20px;background:#f8fafc;border-radius:8px;">
            <h3 style="margin-bottom:4px;">${student.name}</h3>
            <p style="color:#64748b;font-size:13px;">${student.id} | ${student.course} | ${student.year}</p>
            <p style="margin-top:8px;">
                GPA: <strong>${student.gpa.toFixed(2)}</strong> | 
                Overall Average: <strong>${avg}%</strong>
            </p>
        </div>
        <table class="table" style="margin-top:16px;">
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Quiz</th>
                    <th>Assignment</th>
                    <th>Project</th>
                    <th>Exam</th>
                    <th>Total</th>
                    <th>Grade</th>
                </tr>
            </thead>
            <tbody>
                ${gradeDetails.map(g => `
                    <tr>
                        <td>${g.subjectName}</td>
                        <td>${g.quiz}</td>
                        <td>${g.assignment}</td>
                        <td>${g.project}</td>
                        <td>${g.exam}</td>
                        <td class="${GradeX.getGradeClass(g.total)}"><strong>${Math.round(g.total)}%</strong></td>
                        <td><span class="${GradeX.getGradeClass(g.total)}"><strong>${GradeX.getLetterGrade(g.total)}</strong></span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('studentReportResult').innerHTML = html;
}

function generateSubjectReport() {
    const grades = GradeX.getAllGradesWithDetails();
    const subjects = [...new Set(grades.map(g => g.subjectName))];
    
    let html = `
        <div style="margin-bottom:16px;">
            <div class="form-group">
                <label>Select Subject</label>
                <select id="reportSubjectSelect" onchange="showSubjectReport(this.value)">
                    <option value="">-- Select a subject --</option>
                    ${subjects.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>
        </div>
        <div id="subjectReportResult">
            <p style="color:#64748b;text-align:center;padding:40px;">Select a subject to view analysis</p>
        </div>
    `;
    
    return html;
}

function showSubjectReport(subjectName) {
    if (!subjectName) return;
    
    const grades = GradeX.getAllGradesWithDetails().filter(g => g.subjectName === subjectName);
    
    const scores = grades.map(g => g.total);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const passed = grades.filter(g => g.total >= GradeX.state.settings.passingGrade).length;
    const failed = grades.length - passed;
    
    const distribution = {
        'Excellent (90-100)': grades.filter(g => g.total >= 90).length,
        'Good (80-89)': grades.filter(g => g.total >= 80 && g.total < 90).length,
        'Average (70-79)': grades.filter(g => g.total >= 70 && g.total < 80).length,
        'Pass (60-69)': grades.filter(g => g.total >= 60 && g.total < 70).length,
        'Fail (<60)': grades.filter(g => g.total < 60).length
    };
    
    let html = `
        <div style="padding:20px;background:#f8fafc;border-radius:8px;margin-bottom:16px;">
            <h3 style="margin-bottom:8px;">${subjectName} - Performance Analysis</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;">
                <div style="text-align:center;padding:12px;background:white;border-radius:8px;">
                    <div style="font-size:24px;font-weight:700;color:#4f46e5;">${avg}%</div>
                    <div style="font-size:12px;color:#64748b;">Average</div>
                </div>
                <div style="text-align:center;padding:12px;background:white;border-radius:8px;">
                    <div style="font-size:24px;font-weight:700;color:#10b981;">${max}%</div>
                    <div style="font-size:12px;color:#64748b;">Highest</div>
                </div>
                <div style="text-align:center;padding:12px;background:white;border-radius:8px;">
                    <div style="font-size:24px;font-weight:700;color:#ef4444;">${min}%</div>
                    <div style="font-size:12px;color:#64748b;">Lowest</div>
                </div>
                <div style="text-align:center;padding:12px;background:white;border-radius:8px;">
                    <div style="font-size:24px;font-weight:700;color:#10b981;">${passed}</div>
                    <div style="font-size:12px;color:#64748b;">Passed</div>
                </div>
                <div style="text-align:center;padding:12px;background:white;border-radius:8px;">
                    <div style="font-size:24px;font-weight:700;color:#ef4444;">${failed}</div>
                    <div style="font-size:12px;color:#64748b;">Failed</div>
                </div>
                <div style="text-align:center;padding:12px;background:white;border-radius:8px;">
                    <div style="font-size:24px;font-weight:700;color:#64748b;">${grades.length}</div>
                    <div style="font-size:12px;color:#64748b;">Total</div>
                </div>
            </div>
        </div>
        <h4 style="margin-bottom:12px;">Grade Distribution</h4>
        ${Object.entries(distribution).map(([key, value]) => {
            const pct = (value / grades.length) * 100;
            const color = key.includes('Excellent') ? 'green' : 
                         key.includes('Good') ? 'blue' : 
                         key.includes('Fail') ? 'red' : 'yellow';
            return `
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                    <span style="width:140px;font-size:13px;color:#64748b;">${key}</span>
                    <div class="progress-bar" style="flex:1;">
                        <div class="progress ${color}" style="width:${pct}%"></div>
                    </div>
                    <span style="width:60px;text-align:right;font-weight:600;font-size:13px;">${value} (${Math.round(pct)}%)</span>
                </div>
            `;
        }).join('')}
        <table class="table" style="margin-top:16px;">
            <thead>
                <tr>
                    <th>Student</th>
                    <th>Total</th>
                    <th>Grade</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${grades.sort((a, b) => b.total - a.total).map(g => `
                    <tr>
                        <td>${g.studentName}</td>
                        <td class="${GradeX.getGradeClass(g.total)}"><strong>${g.total}%</strong></td>
                        <td><span class="${GradeX.getGradeClass(g.total)}"><strong>${g.letterGrade}</strong></span></td>
                        <td><span class="status-badge ${g.status.class}">${g.status.text}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('subjectReportResult').innerHTML = html;
}

function generateSummaryReport() {
    const grades = GradeX.getAllGradesWithDetails();
    const passing = grades.filter(g => g.total >= GradeX.state.settings.passingGrade).length;
    const failing = grades.length - passing;
    
    // Grade distribution
    const distribution = {
        'A (90-100)': grades.filter(g => g.total >= 90).length,
        'B (80-89)': grades.filter(g => g.total >= 80 && g.total < 90).length,
        'C (70-79)': grades.filter(g => g.total >= 70 && g.total < 80).length,
        'D (60-69)': grades.filter(g => g.total >= 60 && g.total < 70).length,
        'F (<60)': grades.filter(g => g.total < 60).length
    };
    
    let html = `
        <div class="report-header" style="text-align:center;margin-bottom:20px;padding-bottom:20px;border-bottom:2px solid #e2e8f0;">
            <h2 style="font-size:20px;color:#1e293b;">${GradeX.state.settings.schoolName}</h2>
            <p style="color:#64748b;">Academic Summary Report - ${GradeX.state.settings.academicYear}</p>
            <p style="color:#64748b;font-size:13px;">Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:20px;">
            <div style="padding:16px;background:#f8fafc;border-radius:8px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#4f46e5;">${GradeX.students.length}</div>
                <div style="font-size:13px;color:#64748b;">Total Students</div>
            </div>
            <div style="padding:16px;background:#f8fafc;border-radius:8px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#4f46e5;">${GradeX.subjects.length}</div>
                <div style="font-size:13px;color:#64748b;">Subjects Offered</div>
            </div>
            <div style="padding:16px;background:#f8fafc;border-radius:8px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#10b981;">${grades.length}</div>
                <div style="font-size:13px;color:#64748b;">Grades Computed</div>
            </div>
            <div style="padding:16px;background:#f8fafc;border-radius:8px;text-align:center;">
                <div style="font-size:28px;font-weight:700;color:#10b981;">${Math.round((passing/grades.length)*100)}%</div>
                <div style="font-size:13px;color:#64748b;">Overall Passing Rate</div>
            </div>
        </div>
        <h4 style="margin-bottom:12px;">Grade Distribution</h4>
        ${Object.entries(distribution).map(([key, value]) => {
            const pct = grades.length > 0 ? (value / grades.length) * 100 : 0;
            const color = key.startsWith('A') ? 'green' : 
                         key.startsWith('B') ? 'blue' : 
                         key.startsWith('F') ? 'red' : 'yellow';
            return `
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                    <span style="width:100px;font-size:13px;color:#64748b;">${key}</span>
                    <div class="progress-bar" style="flex:1;">
                        <div class="progress ${color}" style="width:${pct}%"></div>
                    </div>
                    <span style="width:80px;text-align:right;font-weight:600;font-size:13px;">${value} (${Math.round(pct)}%)</span>
                </div>
            `;
        }).join('')}
        <p style="text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px;">
            Powered by GradeX - Student Grading System
        </p>
    `;
    
    return html;
}

function printReport() {
    window.print();
}

// ==========================================
// SETTINGS
// ==========================================
function loadSettings() {
    document.getElementById('schoolName').value = GradeX.state.settings.schoolName;
    document.getElementById('academicYear').value = GradeX.state.settings.academicYear;
    document.getElementById('passingGrade').value = GradeX.state.settings.passingGrade;
    document.getElementById('gradeScheme').value = GradeX.state.settings.gradeScheme;
    document.getElementById('quizWeight').value = GradeX.state.gradeWeights.quiz;
    document.getElementById('assignmentWeight').value = GradeX.state.gradeWeights.assignment;
    document.getElementById('projectWeight').value = GradeX.state.gradeWeights.project;
    document.getElementById('examWeight').value = GradeX.state.gradeWeights.exam;
}

function saveSettings() {
    GradeX.state.settings.schoolName = document.getElementById('schoolName').value;
    GradeX.state.settings.academicYear = document.getElementById('academicYear').value;
    GradeX.state.settings.passingGrade = parseInt(document.getElementById('passingGrade').value);
    GradeX.state.settings.gradeScheme = document.getElementById('gradeScheme').value;
    
    GradeX.state.gradeWeights.quiz = parseInt(document.getElementById('quizWeight').value);
    GradeX.state.gradeWeights.assignment = parseInt(document.getElementById('assignmentWeight').value);
    GradeX.state.gradeWeights.project = parseInt(document.getElementById('projectWeight').value);
    GradeX.state.gradeWeights.exam = parseInt(document.getElementById('examWeight').value);
    
    // Validate weights sum to 100
    const total = Object.values(GradeX.state.gradeWeights).reduce((a, b) => a + b, 0);
    if (total !== 100) {
        showToast(`Grade weights must sum to 100% (currently ${total}%)`, 'warning');
        return;
    }
    
    saveToStorage();
    showToast('Settings saved successfully!', 'success');
}

function exportData() {
    const data = {
        students: GradeX.students,
        subjects: GradeX.subjects,
        grades: GradeX.grades,
        settings: GradeX.state.settings,
        weights: GradeX.state.gradeWeights
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gradex-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.students) GradeX.students = data.students;
                if (data.subjects) GradeX.subjects = data.subjects;
                if (data.grades) GradeX.grades = data.grades;
                if (data.settings) GradeX.state.settings = data.settings;
                if (data.weights) GradeX.state.gradeWeights = data.weights;
                
                saveToStorage();
                loadDashboard();
                showToast('Data imported successfully!', 'success');
            } catch (err) {
                showToast('Invalid file format!', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function resetData() {
    if (!confirm('Are you sure you want to reset all data? This action cannot be undone!')) return;
    
    localStorage.removeItem('gradexStudents');
    localStorage.removeItem('gradexSubjects');
    localStorage.removeItem('gradexGrades');
    localStorage.removeItem('gradexSettings');
    localStorage.removeItem('gradexWeights');
    
    location.reload();
}

// ==========================================
// GLOBAL SEARCH
// ==========================================
function handleGlobalSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    if (!query) return;
    
    // Search in students
    const foundStudents = GradeX.students.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.id.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
    );
    
    // Search in subjects
    const foundSubjects = GradeX.subjects.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query)
    );
    
    if (foundStudents.length > 0 || foundSubjects.length > 0) {
        showToast(`Found ${foundStudents.length} students and ${foundSubjects.length} subjects`, 'info');
    }
}

// ==========================================
// MODAL
// ==========================================
function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
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
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3500);
}

