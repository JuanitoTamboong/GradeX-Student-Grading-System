// ==========================================
// GradeX - Dashboard Module (Standalone)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

function initializeDashboard() {
    const user = JSON.parse(localStorage.getItem('gradexUser'));
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    loadFromStorage();
    
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = 
        user.role === 'admin' ? 'Administrator' : 'Teacher';
    document.getElementById('userAvatar').textContent = user.avatar || user.name.charAt(0);
    
    setupRoleBasedAccess(user.role);
    
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
    
    // Navigate to dashboard
    navigateTo('dashboard');
}

function handleLogout() {
    localStorage.removeItem('gradexUser');
    window.location.href = 'login.html';
}

function setupRoleBasedAccess(role) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.style.display = 'flex';
    });
}

function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.remove('active');
    });
    
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');
    
    document.getElementById('sidebar')?.classList.remove('open');
    
    const loaders = {
        dashboard: loadDashboard,
        students: loadStudents,
        grades: loadGrades,
        subjects: loadSubjects,
        reports: loadReports,
        settings: loadSettings
    };
    
    if (loaders[page]) loaders[page]();
}

// ==========================================
// STORAGE
// ==========================================
function saveToStorage() {
    try {
        localStorage.setItem('gradexStudents', JSON.stringify(GradeX.students));
        localStorage.setItem('gradexSubjects', JSON.stringify(GradeX.subjects));
        localStorage.setItem('gradexGrades', JSON.stringify(GradeX.grades));
        localStorage.setItem('gradexSettings', JSON.stringify(GradeX.state.settings));
        localStorage.setItem('gradexWeights', JSON.stringify(GradeX.state.gradeWeights));
    } catch (e) { console.warn('Save error:', e); }
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
    } catch (e) { console.warn('Load error:', e); }
}

// ==========================================
// DASHBOARD
// ==========================================
function loadDashboard() {
    const stats = calculateDashboardStats();
    
    document.getElementById('dashboardStats').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon indigo"><i class="fas fa-user-graduate"></i></div>
            <div class="stat-info">
                <h3>${stats.totalStudents}</h3>
                <p>Total Students</p>
                <span class="stat-change up"><i class="fas fa-arrow-up"></i> ${stats.studentChange}%</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon emerald"><i class="fas fa-book"></i></div>
            <div class="stat-info">
                <h3>${stats.totalSubjects}</h3>
                <p>Active Subjects</p>
                <span class="stat-change up"><i class="fas fa-arrow-up"></i> ${stats.subjectChange}%</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon amber"><i class="fas fa-graduation-cap"></i></div>
            <div class="stat-info">
                <h3>${stats.totalGrades}</h3>
                <p>Grades Computed</p>
                <span class="stat-change up"><i class="fas fa-arrow-up"></i> ${stats.gradeChange}%</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon violet"><i class="fas fa-trophy"></i></div>
            <div class="stat-info">
                <h3>${stats.passingRate}%</h3>
                <p>Passing Rate</p>
                <span class="stat-change up"><i class="fas fa-arrow-up"></i> ${stats.passingChange}%</span>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon cyan"><i class="fas fa-chart-bar"></i></div>
            <div class="stat-info">
                <h3>${stats.averageGrade}%</h3>
                <p>Average Grade</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange"><i class="fas fa-users"></i></div>
            <div class="stat-info">
                <h3>${stats.activeTeachers}</h3>
                <p>Active Teachers</p>
            </div>
        </div>
    `;
    
    loadRecentGrades();
    loadPerformanceChart();
}

function loadRecentGrades() {
    const grades = GradeX.getAllGradesWithDetails().slice(0, 8);
    document.getElementById('recentGradesBody').innerHTML = grades.map(g => `
        <tr>
            <td><strong>${g.studentName}</strong></td>
            <td>${g.subjectName}</td>
            <td class="${GradeX.getGradeClass(g.total)}">${g.total}% (${g.letterGrade})</td>
            <td><span class="status-badge ${g.status.class}">${g.status.text}</span></td>
        </tr>
    `).join('');
}

function loadPerformanceChart() {
    const ctx = document.getElementById('performanceChart')?.getContext('2d');
    if (!ctx) return;
    
    if (window.performanceChartInstance) window.performanceChartInstance.destroy();
    
    const subjectAverages = {};
    GradeX.getAllGradesWithDetails().forEach(g => {
        if (!subjectAverages[g.subjectName]) subjectAverages[g.subjectName] = { total: 0, count: 0 };
        subjectAverages[g.subjectName].total += g.total;
        subjectAverages[g.subjectName].count++;
    });
    
    const labels = Object.keys(subjectAverages);
    const data = labels.map(l => Math.round(subjectAverages[l].total / subjectAverages[l].count));
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#9333ea', '#06b6d4', '#f97316'];
    
    window.performanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Grade (%)',
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
}

// ==========================================
// STUDENTS
// ==========================================
function loadStudents() {
    renderStudents(GradeX.students);
}

function renderStudents(students) {
    document.getElementById('studentsTableBody').innerHTML = students.map(s => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.year}</td>
            <td>${s.course}</td>
            <td>${s.gpa.toFixed(2)}</td>
            <td><span class="status-badge ${s.status}">${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span></td>
            <td>
                <button class="btn-icon-sm edit" title="Edit" onclick="editStudent('${s.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon-sm delete" title="Delete" onclick="deleteStudent('${s.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterStudents() {
    const search = document.getElementById('studentSearch').value.toLowerCase();
    const yearFilter = document.getElementById('studentFilter').value;
    
    const filtered = GradeX.students.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search) || s.id.toLowerCase().includes(search) || s.email.toLowerCase().includes(search);
        return yearFilter === 'all' || s.year === yearFilter;
    });
    
    renderStudents(filtered);
}

function showAddStudentModal() {
    openModal('Add New Student', `
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
            <button type="submit" class="btn btn-primary btn-block" style="margin-top:4px;"><i class="fas fa-save"></i> Save Student</button>
        </form>
    `);
}

function saveStudent(e) {
    e.preventDefault();
    GradeX.students.push({
        id: GradeX.generateId('STU'),
        name: document.getElementById('studentName').value.trim(),
        email: document.getElementById('studentEmail').value.trim(),
        year: document.getElementById('studentYear').value,
        course: document.getElementById('studentCourse').value,
        gpa: 0,
        status: 'active'
    });
    saveToStorage();
    loadStudents();
    closeModal();
    showToast('Student added successfully!', 'success');
}

function editStudent(id) {
    const student = GradeX.students.find(s => s.id === id);
    if (!student) return;
    
    openModal('Edit Student', `
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
                    ${['1st Year','2nd Year','3rd Year','4th Year'].map(y => `<option value="${y}" ${student.year === y ? 'selected' : ''}>${y}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Course</label>
                <select id="studentCourse" required>
                    ${['BS Computer Science','BS Information Technology','BS Information Systems','BS Computer Engineering'].map(c => `<option value="${c}" ${student.course === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="studentStatus">
                    <option value="active" ${student.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${student.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top:4px;"><i class="fas fa-save"></i> Update Student</button>
        </form>
    `);
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
    if (!confirm('Delete this student?')) return;
    GradeX.students = GradeX.students.filter(s => s.id !== id);
    GradeX.grades = GradeX.grades.filter(g => g.studentId !== id);
    saveToStorage();
    loadStudents();
    showToast('Student deleted', 'info');
}

// ==========================================
// GRADES
// ==========================================
function loadGrades() {
    const grades = GradeX.getAllGradesWithDetails();
    renderGrades(grades);
    
    const filterSelect = document.getElementById('gradeSubjectFilter');
    const subjects = [...new Set(grades.map(g => g.subjectName))];
    filterSelect.innerHTML = '<option value="all">All Subjects</option>' + subjects.map(s => `<option value="${s}">${s}</option>`).join('');
}

function renderGrades(grades) {
    document.getElementById('gradesTableBody').innerHTML = grades.map(g => `
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
                <button class="btn-icon-sm edit" title="Edit" onclick="editGrade('${g.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon-sm delete" title="Delete" onclick="deleteGrade('${g.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterGrades() {
    const search = document.getElementById('gradeSearch').value.toLowerCase();
    const subjectFilter = document.getElementById('gradeSubjectFilter').value;
    const grades = GradeX.getAllGradesWithDetails().filter(g => {
        const matchesSearch = g.studentName.toLowerCase().includes(search) || g.subjectName.toLowerCase().includes(search);
        return matchesSearch && (subjectFilter === 'all' || g.subjectName === subjectFilter);
    });
    renderGrades(grades);
}

function showAddGradeModal() {
    const studentOptions = GradeX.students.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
    const subjectOptions = GradeX.subjects.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join('');
    
    openModal('Add New Grade', `
        <form id="gradeForm" onsubmit="saveGrade(event)">
            <div class="form-group">
                <label>Student</label>
                <select id="gradeStudent" required><option value="">Select student</option>${studentOptions}</select>
            </div>
            <div class="form-group">
                <label>Subject</label>
                <select id="gradeSubject" required><option value="">Select subject</option>${subjectOptions}</select>
            </div>
            <div class="form-group">
                <label>Quiz Score (0-100)</label>
                <input type="number" id="gradeQuiz" min="0" max="100" placeholder="Quiz score" required>
            </div>
            <div class="form-group">
                <label>Assignment Score (0-100)</label>
                <input type="number" id="gradeAssignment" min="0" max="100" placeholder="Assignment score" required>
            </div>
            <div class="form-group">
                <label>Project Score (0-100)</label>
                <input type="number" id="gradeProject" min="0" max="100" placeholder="Project score" required>
            </div>
            <div class="form-group">
                <label>Exam Score (0-100)</label>
                <input type="number" id="gradeExam" min="0" max="100" placeholder="Exam score" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top:4px;"><i class="fas fa-save"></i> Save Grade</button>
        </form>
    `);
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
    
    if (GradeX.grades.find(g => g.studentId === grade.studentId && g.subjectCode === grade.subjectCode)) {
        showToast('Grade already exists for this student and subject!', 'warning');
        return;
    }
    
    GradeX.grades.push(grade);
    const student = GradeX.getStudent(grade.studentId);
    if (student) student.gpa = GradeX.calculateGPA(grade.studentId);
    
    saveToStorage();
    loadGrades();
    closeModal();
    showToast('Grade added successfully!', 'success');
}

function editGrade(id) {
    const grade = GradeX.grades.find(g => g.id === id);
    if (!grade) return;
    
    const studentOptions = GradeX.students.map(s => `<option value="${s.id}" ${s.id === grade.studentId ? 'selected' : ''}>${s.name}</option>`).join('');
    const subjectOptions = GradeX.subjects.map(s => `<option value="${s.code}" ${s.code === grade.subjectCode ? 'selected' : ''}>${s.name}</option>`).join('');
    
    openModal('Edit Grade', `
        <form id="gradeForm" onsubmit="updateGrade(event, '${id}')">
            <div class="form-group"><label>Student</label><select id="gradeStudent">${studentOptions}</select></div>
            <div class="form-group"><label>Subject</label><select id="gradeSubject">${subjectOptions}</select></div>
            <div class="form-group"><label>Quiz Score</label><input type="number" id="gradeQuiz" value="${grade.quiz}" min="0" max="100" required></div>
            <div class="form-group"><label>Assignment Score</label><input type="number" id="gradeAssignment" value="${grade.assignment}" min="0" max="100" required></div>
            <div class="form-group"><label>Project Score</label><input type="number" id="gradeProject" value="${grade.project}" min="0" max="100" required></div>
            <div class="form-group"><label>Exam Score</label><input type="number" id="gradeExam" value="${grade.exam}" min="0" max="100" required></div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top:4px;"><i class="fas fa-save"></i> Update Grade</button>
        </form>
    `);
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
    
    const oldS = GradeX.getStudent(oldStudentId);
    if (oldS) oldS.gpa = GradeX.calculateGPA(oldStudentId);
    const newS = GradeX.getStudent(grade.studentId);
    if (newS && oldStudentId !== grade.studentId) newS.gpa = GradeX.calculateGPA(grade.studentId);
    
    saveToStorage();
    loadGrades();
    closeModal();
    showToast('Grade updated successfully!', 'success');
}

function deleteGrade(id) {
    if (!confirm('Delete this grade?')) return;
    const grade = GradeX.grades.find(g => g.id === id);
    GradeX.grades = GradeX.grades.filter(g => g.id !== id);
    if (grade) {
        const student = GradeX.getStudent(grade.studentId);
        if (student) student.gpa = GradeX.calculateGPA(grade.studentId);
    }
    saveToStorage();
    loadGrades();
    showToast('Grade deleted', 'info');
}

function computeAllGrades() {
    GradeX.students.forEach(s => s.gpa = GradeX.calculateGPA(s.id));
    saveToStorage();
    loadGrades();
    showToast(`Computed ${GradeX.grades.length} grades successfully!`, 'success');
}

// ==========================================
// SUBJECTS
// ==========================================
function loadSubjects() {
    document.getElementById('subjectsTableBody').innerHTML = GradeX.subjects.map(s => `
        <tr>
            <td><strong>${s.code}</strong></td>
            <td>${s.name}</td>
            <td>${s.instructor}</td>
            <td>${s.credits}</td>
            <td>${s.students}</td>
            <td>
                <button class="btn-icon-sm edit" title="Edit" onclick="editSubject('${s.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon-sm delete" title="Delete" onclick="deleteSubject('${s.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function showAddSubjectModal() {
    openModal('Add New Subject', `
        <form id="subjectForm" onsubmit="saveSubject(event)">
            <div class="form-group"><label>Subject Code</label><input type="text" id="subjectCode" placeholder="e.g., CS101" required></div>
            <div class="form-group"><label>Subject Name</label><input type="text" id="subjectName" placeholder="Enter subject name" required></div>
            <div class="form-group"><label>Instructor</label><input type="text" id="subjectInstructor" placeholder="Instructor name" required></div>
            <div class="form-group"><label>Credits</label><input type="number" id="subjectCredits" min="1" max="6" placeholder="Credits" required></div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top:4px;"><i class="fas fa-save"></i> Save Subject</button>
        </form>
    `);
}

function saveSubject(e) {
    e.preventDefault();
    GradeX.subjects.push({
        id: GradeX.generateId('SUB'),
        code: document.getElementById('subjectCode').value.trim().toUpperCase(),
        name: document.getElementById('subjectName').value.trim(),
        instructor: document.getElementById('subjectInstructor').value.trim(),
        credits: parseInt(document.getElementById('subjectCredits').value),
        students: 0
    });
    saveToStorage();
    loadSubjects();
    closeModal();
    showToast('Subject added successfully!', 'success');
}

function editSubject(id) {
    const subject = GradeX.subjects.find(s => s.id === id);
    if (!subject) return;
    openModal('Edit Subject', `
        <form id="subjectForm" onsubmit="updateSubject(event, '${id}')">
            <div class="form-group"><label>Subject Code</label><input type="text" id="subjectCode" value="${subject.code}" required></div>
            <div class="form-group"><label>Subject Name</label><input type="text" id="subjectName" value="${subject.name}" required></div>
            <div class="form-group"><label>Instructor</label><input type="text" id="subjectInstructor" value="${subject.instructor}" required></div>
            <div class="form-group"><label>Credits</label><input type="number" id="subjectCredits" value="${subject.credits}" min="1" max="6" required></div>
            <button type="submit" class="btn btn-primary btn-block" style="margin-top:4px;"><i class="fas fa-save"></i> Update Subject</button>
        </form>
    `);
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
    if (!confirm('Delete this subject?')) return;
    const code = GradeX.subjects.find(s => s.id === id)?.code;
    GradeX.subjects = GradeX.subjects.filter(s => s.id !== id);
    if (code) GradeX.grades = GradeX.grades.filter(g => g.subjectCode !== code);
    saveToStorage();
    loadSubjects();
    showToast('Subject deleted', 'info');
}

// ==========================================
// REPORTS
// ==========================================
function loadReports() {
    document.getElementById('reportResult').style.display = 'none';
}

function closeReport() {
    document.getElementById('reportResult').style.display = 'none';
}

function generateReport(type) {
    const content = document.getElementById('reportContent');
    const result = document.getElementById('reportResult');
    
    const generators = {
        class: generateClassReport,
        student: generateStudentReportForm,
        subject: generateSubjectReport,
        summary: generateSummaryReport
    };
    
    content.innerHTML = generators[type]?.() || '';
    result.style.display = 'block';
    showToast('Report generated successfully!', 'success');
}

function generateClassReport() {
    const grades = GradeX.getAllGradesWithDetails();
    const subjects = [...new Set(grades.map(g => g.subjectName))];
    
    let html = `
        <div class="report-header">
            <h2>${GradeX.state.settings.schoolName}</h2>
            <p>Class Performance Report - AY ${GradeX.state.settings.academicYear}</p>
            <p style="font-size:13px;">Generated: ${new Date().toLocaleDateString()}</p>
        </div>
    `;
    
    subjects.forEach(subject => {
        const subjectGrades = grades.filter(g => g.subjectName === subject);
        const avg = Math.round(subjectGrades.reduce((sum, g) => sum + g.total, 0) / subjectGrades.length);
        const passed = subjectGrades.filter(g => g.total >= GradeX.state.settings.passingGrade).length;
        
        html += `
            <div style="margin-bottom:20px;padding:16px;background:#f8fafc;border-radius:8px;">
                <h3 style="display:flex;justify-content:space-between;margin-bottom:12px;">
                    <span>${subject}</span>
                    <span>Average: <strong>${avg}%</strong></span>
                </h3>
                <div style="display:flex;gap:16px;font-size:13px;">
                    <span>Passed: <strong style="color:#10b981;">${passed}</strong></span>
                    <span>Failed: <strong style="color:#ef4444;">${subjectGrades.length - passed}</strong></span>
                    <span>Total: <strong>${subjectGrades.length}</strong></span>
                </div>
                <div style="margin-top:8px;">
                    <div class="progress-bar"><div class="progress green" style="width:${(passed/subjectGrades.length)*100}%"></div></div>
                </div>
            </div>
        `;
    });
    return html;
}

function generateStudentReportForm() {
    const options = GradeX.students.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('');
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
    
    const grades = GradeX.getStudentGrades(studentId).map(g => {
        const subject = GradeX.getSubject(g.subjectCode);
        return { ...g, subjectName: subject?.name || 'Unknown', total: GradeX.computeTotal(g) };
    });
    
    const avg = grades.length > 0 ? Math.round(grades.reduce((sum, g) => sum + g.total, 0) / grades.length) : 0;
    
    document.getElementById('studentReportResult').innerHTML = `
        <div style="padding:20px;background:#f8fafc;border-radius:8px;">
            <h3>${student.name}</h3>
            <p style="color:#64748b;font-size:13px;">${student.id} | ${student.course} | ${student.year}</p>
            <p style="margin-top:8px;">GPA: <strong>${student.gpa.toFixed(2)}</strong> | Overall: <strong>${avg}%</strong></p>
        </div>
        <table class="table" style="margin-top:16px;">
            <thead><tr><th>Subject</th><th>Quiz</th><th>Assignment</th><th>Project</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead>
            <tbody>${grades.map(g => `
                <tr>
                    <td>${g.subjectName}</td>
                    <td>${g.quiz}</td><td>${g.assignment}</td><td>${g.project}</td><td>${g.exam}</td>
                    <td class="${GradeX.getGradeClass(g.total)}"><strong>${Math.round(g.total)}%</strong></td>
                    <td><span class="${GradeX.getGradeClass(g.total)}"><strong>${GradeX.getLetterGrade(g.total)}</strong></span></td>
                </tr>
            `).join('')}</tbody>
        </table>
    `;
}

function generateSubjectReport() {
    const grades = GradeX.getAllGradesWithDetails();
    const subjects = [...new Set(grades.map(g => g.subjectName))];
    return `
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
}

function showSubjectReport(subjectName) {
    if (!subjectName) return;
    const grades = GradeX.getAllGradesWithDetails().filter(g => g.subjectName === subjectName);
    const scores = grades.map(g => g.total);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const passed = grades.filter(g => g.total >= GradeX.state.settings.passingGrade).length;
    
    const dist = {'Excellent (90-100)': grades.filter(g => g.total >= 90).length,'Good (80-89)': grades.filter(g => g.total >= 80 && g.total < 90).length,'Average (70-79)': grades.filter(g => g.total >= 70 && g.total < 80).length,'Pass (60-69)': grades.filter(g => g.total >= 60 && g.total < 70).length,'Fail (<60)': grades.filter(g => g.total < 60).length};
    
    document.getElementById('subjectReportResult').innerHTML = `
        <div style="padding:20px;background:#f8fafc;border-radius:8px;margin-bottom:16px;">
            <h3>${subjectName} - Performance Analysis</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-top:16px;">
                <div class="stat-box"><div style="font-size:24px;font-weight:700;color:#4f46e5;">${avg}%</div><div style="font-size:12px;color:#64748b;">Average</div></div>
                <div class="stat-box"><div style="font-size:24px;font-weight:700;color:#10b981;">${max}%</div><div style="font-size:12px;color:#64748b;">Highest</div></div>
                <div class="stat-box"><div style="font-size:24px;font-weight:700;color:#ef4444;">${min}%</div><div style="font-size:12px;color:#64748b;">Lowest</div></div>
                <div class="stat-box"><div style="font-size:24px;font-weight:700;color:#10b981;">${passed}</div><div style="font-size:12px;color:#64748b;">Passed</div></div>
                <div class="stat-box"><div style="font-size:24px;font-weight:700;color:#ef4444;">${grades.length - passed}</div><div style="font-size:12px;color:#64748b;">Failed</div></div>
                <div class="stat-box"><div style="font-size:24px;font-weight:700;color:#64748b;">${grades.length}</div><div style="font-size:12px;color:#64748b;">Total</div></div>
            </div>
        </div>
        <h4 style="margin-bottom:12px;">Grade Distribution</h4>
        ${Object.entries(dist).map(([key, value]) => {
            const pct = (value / grades.length) * 100;
            const color = key.includes('Excellent') ? 'green' : key.includes('Good') ? 'blue' : key.includes('Fail') ? 'red' : 'yellow';
            return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                <span style="width:140px;font-size:13px;color:#64748b;">${key}</span>
                <div class="progress-bar" style="flex:1;"><div class="progress ${color}" style="width:${pct}%"></div></div>
                <span style="width:60px;text-align:right;font-weight:600;font-size:13px;">${value} (${Math.round(pct)}%)</span>
            </div>`;
        }).join('')}
        <table class="table" style="margin-top:16px;">
            <thead><tr><th>Student</th><th>Total</th><th>Grade</th><th>Status</th></tr></thead>
            <tbody>${grades.sort((a,b) => b.total - a.total).map(g => `
                <tr><td>${g.studentName}</td><td class="${GradeX.getGradeClass(g.total)}"><strong>${g.total}%</strong></td><td><span class="${GradeX.getGradeClass(g.total)}"><strong>${g.letterGrade}</strong></span></td><td><span class="status-badge ${g.status.class}">${g.status.text}</span></td></tr>
            `).join('')}</tbody>
        </table>
    `;
}

function generateSummaryReport() {
    const grades = GradeX.getAllGradesWithDetails();
    const passing = grades.filter(g => g.total >= GradeX.state.settings.passingGrade).length;
    const dist = {'A (90-100)': grades.filter(g => g.total >= 90).length,'B (80-89)': grades.filter(g => g.total >= 80 && g.total < 90).length,'C (70-79)': grades.filter(g => g.total >= 70 && g.total < 80).length,'D (60-69)': grades.filter(g => g.total >= 60 && g.total < 70).length,'F (<60)': grades.filter(g => g.total < 60).length};
    
    return `
        <div class="report-header">
            <h2>${GradeX.state.settings.schoolName}</h2>
            <p>Academic Summary Report - ${GradeX.state.settings.academicYear}</p>
            <p style="font-size:13px;">Generated: ${new Date().toLocaleDateString()}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:20px;">
            <div class="summary-stat"><div style="font-size:28px;font-weight:700;color:#4f46e5;">${GradeX.students.length}</div><div style="font-size:13px;color:#64748b;">Total Students</div></div>
            <div class="summary-stat"><div style="font-size:28px;font-weight:700;color:#4f46e5;">${GradeX.subjects.length}</div><div style="font-size:13px;color:#64748b;">Subjects Offered</div></div>
            <div class="summary-stat"><div style="font-size:28px;font-weight:700;color:#10b981;">${grades.length}</div><div style="font-size:13px;color:#64748b;">Grades Computed</div></div>
            <div class="summary-stat"><div style="font-size:28px;font-weight:700;color:#10b981;">${Math.round((passing/grades.length)*100)}%</div><div style="font-size:13px;color:#64748b;">Passing Rate</div></div>
        </div>
        <h4 style="margin-bottom:12px;">Grade Distribution</h4>
        ${Object.entries(dist).map(([key, value]) => {
            const pct = grades.length > 0 ? (value / grades.length) * 100 : 0;
            const color = key.startsWith('A') ? 'green' : key.startsWith('B') ? 'blue' : key.startsWith('F') ? 'red' : 'yellow';
            return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
                <span style="width:100px;font-size:13px;">${key}</span>
                <div class="progress-bar" style="flex:1;"><div class="progress ${color}" style="width:${pct}%"></div></div>
                <span style="width:80px;text-align:right;font-weight:600;font-size:13px;">${value} (${Math.round(pct)}%)</span>
            </div>`;
        }).join('')}
        <p style="text-align:center;margin-top:20px;padding-top:20px;border-top:1px solid #e2e8f0;color:#64748b;font-size:13px;">Powered by GradeX - Student Grading System</p>
    `;
}

function printReport() { window.print(); }

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
    
    const total = Object.values(GradeX.state.gradeWeights).reduce((a, b) => a + b, 0);
    if (total !== 100) {
        showToast(`Grade weights must sum to 100% (currently ${total}%)`, 'warning');
        return;
    }
    saveToStorage();
    showToast('Settings saved successfully!', 'success');
}

function exportData() {
    const data = { students: GradeX.students, subjects: GradeX.subjects, grades: GradeX.grades, settings: GradeX.state.settings, weights: GradeX.state.gradeWeights };
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
            } catch (err) { showToast('Invalid file format!', 'error'); }
        };
        reader.readAsText(file);
    };
    input.click();
}

function resetData() {
    if (!confirm('Reset all data? This cannot be undone!')) return;
    localStorage.removeItem('gradexStudents');
    localStorage.removeItem('gradexSubjects');
    localStorage.removeItem('gradexGrades');
    localStorage.removeItem('gradexSettings');
    localStorage.removeItem('gradexWeights');
    location.reload();
}

function handleGlobalSearch(e) {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return;
    const students = GradeX.students.filter(s => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
    const subjects = GradeX.subjects.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    if (students.length || subjects.length) showToast(`Found ${students.length} students and ${subjects.length} subjects`, 'info');
}

// ==========================================
// MODAL & TOAST
// ==========================================
function openModal(title, bodyHtml) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'fas fa-check-circle', error: 'fas fa-times-circle', warning: 'fas fa-exclamation-triangle', info: 'fas fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

