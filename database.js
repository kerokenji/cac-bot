// database.js
const Database = require('better-sqlite3');
const db = new Database('bot.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY, 
        value INTEGER
    );

    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY, 
        points INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS dailies (
        user_id TEXT PRIMARY KEY, 
        last_date TEXT
    );

    CREATE TABLE IF NOT EXISTS levels_chat (
        user_id TEXT PRIMARY KEY, 
        xp INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS levels_voice (
        user_id TEXT PRIMARY KEY, 
        xp INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS pets (
        user_id TEXT PRIMARY KEY, 
        breed TEXT, 
        last_fed INTEGER, 
        sickness REAL DEFAULT 5, 
        rabies_expire INTEGER, 
        mood INTEGER DEFAULT 10, 
        death_date INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notifications (
        user_id TEXT PRIMARY KEY, 
        enabled INTEGER DEFAULT 1
    );
`);

// Khởi tạo config mặc định (quan trọng nhất để tránh crash)
db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)').run('points_per_msg', 2);
db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)').run('cooldown_sec', 10);

console.log('✅ Database đã sẵn sàng (config mặc định đã được tạo)');

module.exports = db;