// ==========================================
// GradeX - Database Initialization
// ==========================================
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'account.db');

function initDatabase() {
    const db = new Database(DB_PATH);

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');

    // Create users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'teacher')),
            avatar TEXT NOT NULL DEFAULT 'U',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed default accounts if table is empty
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
    
    if (count.count === 0) {
        const insert = db.prepare(
            'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)'
        );

        insert.run('Admin User', 'admin@gradex.com', 'admin123', 'admin', 'A');
        insert.run('Dr. Sarah Johnson', 'teacher@gradex.com', 'teacher123', 'teacher', 'S');

        console.log('✓ Default accounts seeded successfully');
    } else {
        console.log('✓ Database already has users, skipping seed');
    }

    db.close();
    console.log('✓ Database initialized successfully');
}

// Run if executed directly
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;

