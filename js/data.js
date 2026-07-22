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
    // USERS (loaded from database via API)
    // ==========================================
    users: [],

    // ==========================================
    // EMPTY DATA COLLECTIONS (add via UI)
    // ==========================================
    students: [],
    subjects: [],
    grades: [],

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
