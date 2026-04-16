// utils/playtimeUtils.js
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const SQ3_PATH = path.join(__dirname, '../data/sourcemod-local.sq3');
const MAPPING_PATH = path.join(__dirname, '../data/steam_discord_mapping.json');

function extractZ(steamId) {
    if (typeof steamId !== 'string') steamId = String(steamId);
    if (steamId.includes(':')) {
        return steamId.split(':').pop();   // Chỉ lấy số sau dấu : cuối cùng
    }
    return steamId;
}

function loadMapping() {
    if (!fs.existsSync(MAPPING_PATH)) return {};
    try {
        const raw = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf-8'));
        const mapping = {};
        for (const [k, v] of Object.entries(raw)) {
            mapping[extractZ(k)] = Number(v);
        }
        return mapping;
    } catch (e) { return {}; }
}

function getPlaytimeDB() {
    if (!fs.existsSync(SQ3_PATH)) return {};
    try {
        const db = new Database(SQ3_PATH, { readonly: true });
        const rows = db.prepare("SELECT steamid, minutes FROM playtime").all();
        db.close();
        const data = {};
        rows.forEach(row => {
            data[extractZ(row.steamid)] = Number(row.minutes);
        });
        return data;
    } catch (e) { return {}; }
}

async function getPlaytimeForUser(discordId) {
    const mapping = loadMapping();
    const playtimeDB = getPlaytimeDB();
    const steamZ = Object.keys(mapping).find(z => mapping[z] === Number(discordId));

    if (!steamZ) return { success: false, message: 'chưa liên kết' };

    const minutes = playtimeDB[steamZ] || 0;
    return {
        success: true,
        minutes,
        hours: (minutes / 60).toFixed(1)
    };
}

function getRoleChanges(guild) {
    const PLAYTIME_ROLES = [ /* giữ nguyên như trước */ ];
    // ... (code getRoleChanges giống file trước, bạn copy từ tin nhắn cũ nếu cần)
    // Hiện tại bạn chỉ cần /admin pta nên tạm thời để trống cũng được
    return [];
}

module.exports = {
    getPlaytimeForUser,
    getRoleChanges,
    loadMapping,
    getPlaytimeDB
};