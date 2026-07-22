// ==========================================
// GradeX - Data Layer
// ==========================================

const GradeX = {
    // ==========================================
    // STATE
    // ==========================================
    state: {
        currentUser: null,
        currentPage: 'dashboard',
        gradeWeights: { quiz: 20, assignment: 20, project: 30, exam: 30 },
        settings: {
            schoolName: 'GradeX University',
            academicYear: '2024-2025',
            passingGrade: 60,
            gradeScheme: 'A-F'
        }
    },

    // ==========================================
    // USERS
    // ==========================================
    users: [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@gradex.com',
            password: 'admin123',
            role: 'admin',
            avatar: 'A'
        },
        {
            id: 2,
            name: 'Dr. Sarah Johnson',
            email: 'teacher@gradex.com',
            password: 'teacher123',
            role: 'teacher',
            avatar: 'S'
        },
        {
            id: 3,
            name: 'John Doe',
            email: 'student@gradex.com',
            password: 'student123',
            role: 'student',
            avatar: 'J'
        }
    ],

    // ==========================================
    // STUDENTS
    // ==========================================
    students: [
        { id: 'STU-001', name: 'Alice Johnson', email: 'alice@gradex.com', year: '2nd Year', course: 'BS Computer Science', gpa: 1.45, status: 'active' },
        { id: 'STU-002', name: 'Bob Smith', email: 'bob@gradex.com', year: '3rd Year', course: 'BS Information Technology', gpa: 1.75, status: 'active' },
        { id: 'STU-003', name: 'Carol Williams', email: 'carol@gradex.com', year: '1st Year', course: 'BS Computer Science', gpa: 1.25, status: 'active' },
        { id: 'STU-004', name: 'David Brown', email: 'david@gradex.com', year: '2nd Year', course: 'BS Information Systems', gpa: 2.00, status: 'active' },
        { id: 'STU-005', name: 'Eve Davis', email: 'eve@gradex.com', year: '4th Year', course: 'BS Computer Science', gpa: 1.50, status: 'active' },
        { id: 'STU-006', name: 'Frank Miller', email: 'frank@gradex.com', year: '3rd Year', course: 'BS Information Technology', gpa: 2.25, status: 'active' },
        { id: 'STU-007', name: 'Grace Wilson', email: 'grace@gradex.com', year: '1st Year', course: 'BS Computer Engineering', gpa: 1.75, status: 'active' },
        { id: 'STU-008', name: 'Henry Taylor', email: 'henry@gradex.com', year: '2nd Year', course: 'BS Computer Science', gpa: 2.50, status: 'inactive' },
        { id: 'STU-009', name: 'Ivy Anderson', email: 'ivy@gradex.com', year: '4th Year', course: 'BS Information Technology', gpa: 1.00, status: 'active' },
        { id: 'STU-010', name: 'Jack Thomas', email: 'jack@gradex.com', year: '3rd Year', course: 'BS Information Systems', gpa: 1.85, status: 'active' },
        { id: 'STU-011', name: 'Karen Jackson', email: 'karen@gradex.com', year: '1st Year', course: 'BS Computer Science', gpa: 2.00, status: 'active' },
        { id: 'STU-012', name: 'Leo White', email: 'leo@gradex.com', year: '2nd Year', course: 'BS Computer Engineering', gpa: 1.60, status: 'active' }
    ],

    // ==========================================
    // SUBJECTS
    // ==========================================
    subjects: [
        { id: 'SUB-001', code: 'CS101', name: 'Introduction to Programming', instructor: 'Dr. Sarah Johnson', credits: 3, students: 45 },
        { id: 'SUB-002', code: 'CS201', name: 'Data Structures & Algorithms', instructor: 'Dr. Michael Chen', credits: 4, students: 38 },
        { id: 'SUB-003', code: 'CS301', name: 'Database Management Systems', instructor: 'Prof. Emily Roberts', credits: 3, students: 42 },
        { id: 'SUB-004', code: 'IT101', name: 'Web Development Fundamentals', instructor: 'Dr. Sarah Johnson', credits: 3, students: 50 },
        { id: 'SUB-005', code: 'CS401', name: 'Software Engineering', instructor: 'Prof. James Wilson', credits: 4, students: 35 },
        { id: 'SUB-006', code: 'IT201', name: 'Network Security', instructor: 'Dr. Lisa Brown', credits: 3, students: 40 },
        { id: 'SUB-007', code: 'CS202', name: 'Object-Oriented Programming', instructor: 'Dr. Sarah Johnson', credits: 3, students: 44 },
        { id: 'SUB-008', code: 'MATH101', name: 'Discrete Mathematics', instructor: 'Prof. Robert Davis', credits: 3, students: 48 }
    ],

    // ==========================================
    // GRADES
    // ==========================================
    grades: [
        { id: 'GRD-001', studentId: 'STU-001', subjectCode: 'CS101', quiz: 88, assignment: 92, project: 85, exam: 90 },
        { id: 'GRD-002', studentId: 'STU-001', subjectCode: 'CS201', quiz: 78, assignment: 85, project: 80, exam: 82 },
        { id: 'GRD-003', studentId: 'STU-002', subjectCode: 'CS101', quiz: 72, assignment: 78, project: 75, exam: 70 },
        { id: 'GRD-004', studentId: 'STU-002', subjectCode: 'IT101', quiz: 85, assignment: 80, project: 82, exam: 78 },
        { id: 'GRD-005', studentId: 'STU-003', subjectCode: 'CS101', quiz: 95, assignment: 98, project: 92, exam: 96 },
        { id: 'GRD-006', studentId: 'STU-003', subjectCode: 'MATH101', quiz: 90, assignment: 92, project: 88, exam: 94 },
        { id: 'GRD-007', studentId: 'STU-004', subjectCode: 'CS201', quiz: 80, assignment: 76, project: 78, exam: 82 },
        { id: 'GRD-008', studentId: 'STU-004', subjectCode: 'IT101', quiz: 75, assignment: 80, project: 72, exam: 70 },
        { id: 'GRD-009', studentId: 'STU-005', subjectCode: 'CS301', quiz: 92, assignment: 90, project: 95, exam: 88 },
        { id: 'GRD-010', studentId: 'STU-005', subjectCode: 'CS401', quiz: 88, assignment: 85, project: 90, exam: 92 },
        { id: 'GRD-011', studentId: 'STU-006', subjectCode: 'IT101', quiz: 68, assignment: 72, project: 70, exam: 65 },
        { id: 'GRD-012', studentId: 'STU-006', subjectCode: 'IT201', quiz: 75, assignment: 78, project: 72, exam: 74 },
        { id: 'GRD-013', studentId: 'STU-007', subjectCode: 'CS101', quiz: 85, assignment: 88, project: 82, exam: 86 },
        { id: 'GRD-014', studentId: 'STU-007', subjectCode: 'MATH101', quiz: 82, assignment: 80, project: 78, exam: 84 },
        { id: 'GRD-015', studentId: 'STU-008', subjectCode: 'CS202', quiz: 55, assignment: 60, project: 58, exam: 52 },
        { id: 'GRD-016', studentId: 'STU-009', subjectCode: 'CS301', quiz: 98, assignment: 96, project: 94, exam: 97 },
        { id: 'GRD-017', studentId: 'STU-009', subjectCode: 'IT201', quiz: 94, assignment: 92, project: 90, exam: 95 },
        { id: 'GRD-018', studentId: 'STU-010', subjectCode: 'CS201', quiz: 82, assignment: 84, project: 80, exam: 78 },
        { id: 'GRD-019', studentId: 'STU-010', subjectCode: 'CS301', quiz: 78, assignment: 80, project: 82, exam: 76 },
        { id: 'GRD-020', studentId: 'STU-011', subjectCode: 'CS101', quiz: 70, assignment: 75, project: 72, exam: 68 }
    ],

    // ==========================================
    // HELPER METHODS
    // ==========================================

    // Compute total grade based on weights
    computeTotal(grade) {
        const w = this.state.gradeWeights;
        return (grade.quiz * w.quiz / 100) +
               (grade.assignment * w.assignment / 100) +
               (grade.project * w.project / 100) +
               (grade.exam * w.exam / 100);
    },

    // Get letter grade from numeric score
    getLetterGrade(total) {
        if (total >= 97) return 'A+';
        if (total >= 93) return 'A';
        if (total >= 90) return 'A-';
        if (total >= 87) return 'B+';
        if (total >= 83) return 'B';
        if (total >= 80) return 'B-';
        if (total >= 77) return 'C+';
        if (total >= 73) return 'C';
        if (total >= 70) return 'C-';
        if (total >= 67) return 'D+';
        if (total >= 60) return 'D';
        return 'F';
    },

    // Get grade color class
    getGradeClass(total) {
        if (total >= 90) return 'grade-A';
        if (total >= 80) return 'grade-B';
        if (total >= 70) return 'grade-C';
        if (total >= 60) return 'grade-D';
        return 'grade-F';
    },

    // Get status from total
    getStatus(total) {
        if (total >= 90) return { text: 'Excellent', class: 'excellent' };
        if (total >= 80) return { text: 'Good', class: 'good' };
        if (total >= 70) return { text: 'Average', class: 'average' };
        if (total >= 60) return { text: 'Passed', class: 'passed' };
        return { text: 'Failed', class: 'failed' };
    },

    // Get student by ID
    getStudent(id) {
        return this.students.find(s => s.id === id);
    },

    // Get subject by code
    getSubject(code) {
        return this.subjects.find(s => s.code === code);
    },

    // Get grades for a student
    getStudentGrades(studentId) {
        return this.grades.filter(g => g.studentId === studentId);
    },

    // Calculate GPA from grades
    calculateGPA(studentId) {
        const grades = this.getStudentGrades(studentId);
        if (grades.length === 0) return 0;
        
        const total = grades.reduce((sum, g) => {
            const computed = this.computeTotal(g);
            return sum + this.gradeToGPA(computed);
        }, 0);
        
        return total / grades.length;
    },

    // Convert numeric grade to GPA (1.0 - 5.0 scale)
    gradeToGPA(total) {
        if (total >= 97) return 1.00;
        if (total >= 93) return 1.25;
        if (total >= 90) return 1.50;
        if (total >= 87) return 1.75;
        if (total >= 83) return 2.00;
        if (total >= 80) return 2.25;
        if (total >= 77) return 2.50;
        if (total >= 73) return 2.75;
        if (total >= 70) return 3.00;
        if (total >= 67) return 3.25;
        if (total >= 60) return 3.50;
        return 5.00;
    },

    // Get all grades with computed values
    getAllGradesWithDetails() {
        return this.grades.map(g => {
            const student = this.getStudent(g.studentId);
            const subject = this.getSubject(g.subjectCode);
            const total = this.computeTotal(g);
            const letterGrade = this.getLetterGrade(total);
            const status = this.getStatus(total);
            
            return {
                ...g,
                studentName: student ? student.name : 'Unknown',
                subjectName: subject ? subject.name : 'Unknown',
                instructor: subject ? subject.instructor : 'Unknown',
                total: Math.round(total * 100) / 100,
                letterGrade,
                status
            };
        });
    },

    // Generate unique ID
    generateId(prefix) {
        const num = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        return `${prefix}-${num}`;
    }
};

