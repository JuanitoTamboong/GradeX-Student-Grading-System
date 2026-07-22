// ==========================================
// GradeX - Express Server with SQLite Backend
// ==========================================

const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const initDatabase = require('./database/init_db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, assets)
app.use(express.static(path.join(__dirname)));

// ==========================================
// DATABASE
// ==========================================
const DB_PATH = path.join(__dirname, 'database', 'account.db');

function getDb() {
    return new Database(DB_PATH);
}

// Initialize database on startup
initDatabase();

// ==========================================
// API ROUTES
// ==========================================

// POST /api/login - Authenticate user
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }

    try {
        const db = getDb();
        const user = db.prepare(
            'SELECT id, name, email, role, avatar, created_at FROM users WHERE email = ? AND password = ?'
        ).get(email, password);
        db.close();

        if (user) {
            return res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /api/users - List all users (admin only in future)
app.get('/api/users', (req, res) => {
    try {
        const db = getDb();
        // Never return passwords in API responses
        const users = db.prepare(
            'SELECT id, name, email, role, avatar, created_at FROM users'
        ).all();
        db.close();
        return res.json({ success: true, users });
    } catch (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// ==========================================
// START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  GradeX Server is running!`);
    console.log(`  Local:   http://localhost:${PORT}`);
    console.log(`  Login:   http://localhost:${PORT}/login.html`);
    console.log(`========================================\n`);
});

