// ==========================================
// GradeX - Database Initialization
// ==========================================
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'account.db');

/**
 * Hash a password using SHA-256 with a random salt.
 * Format: salt$hash (hex encoded)
 */
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
    return salt + '$' + hash;
}

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

    const count = db.prepare('SELECT COUNT(*) as count FROM users').get();
    
    if (count.count === 0) {
        const insert = db.prepare(
            'INSERT INTO users (name, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)'
        );

        insert.run('Admin User', 'admin@gradex.com', hashPassword('admin123'), 'admin', 'A');
        insert.run('Dr. Sarah Johnson', 'teacher@gradex.com', hashPassword('teacher123'), 'teacher', 'S');

        console.log('✓ Default accounts seeded successfully (passwords hashed)');
    } else {
        console.log('✓ Database already has users, skipping seed');
    }

    db.close();
    console.log('✓ Database initialized successfully');
}

/**
 * Verify a password against a stored hash (salt$hash format)
 */
function verifyPassword(password, storedHash) {
    const parts = storedHash.split('$');
    if (parts.length !== 2) {
        // Fallback for legacy plaintext passwords
        return password === storedHash;
    }
    const salt = parts[0];
    const hash = crypto.createHash('sha256').update(salt + password).digest('hex');
    return hash === parts[1];
}

// Run if executed directly
if (require.main === module) {
    initDatabase();
}

module.exports = initDatabase;
module.exports.verifyPassword = verifyPassword;
module.exports.hashPassword = hashPassword;

