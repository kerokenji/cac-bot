const Database = require('better-sqlite3');
const db = new Database('catbot.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value INTEGER);
  CREATE TABLE IF NOT EXISTS users (user_id TEXT PRIMARY KEY, points INTEGER DEFAULT 0, cooldown REAL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS dailies (user_id TEXT PRIMARY KEY, last_date TEXT);
  CREATE TABLE IF NOT EXISTS levels_chat (user_id TEXT PRIMARY KEY, xp INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS levels_voice (user_id TEXT PRIMARY KEY, xp INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS pets (user_id TEXT PRIMARY KEY, breed TEXT, last_fed INTEGER, sickness REAL DEFAULT 5, rabies_expire INTEGER, mood INTEGER DEFAULT 10, death_date INTEGER DEFAULT 0);
  CREATE TABLE IF NOT EXISTS notifications (user_id TEXT PRIMARY KEY, enabled INTEGER DEFAULT 1);
  CREATE TABLE IF NOT EXISTS inventory (user_id TEXT, item TEXT, quantity INTEGER DEFAULT 0, PRIMARY KEY(user_id, item));
`);

module.exports = db;
