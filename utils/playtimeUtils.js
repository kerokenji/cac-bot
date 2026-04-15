// utils/playtimeUtils.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const SQ3_PATH = path.join(__dirname, '../data/sourcemod-local.sq3');
const MAPPING_PATH = path.join(__dirname, '../data/steam_discord_mapping.json');

function extractZ(steamId) {
    if (steamId.includes(':')) {
        const parts = steamId.split(':');
        return parts.length === 3 ? parts[2] : steamId;
    }
    return steamId;
}

function loadMapping() {
    if (!fs.existsSync(MAPPING_PATH)) {
        console.warn('⚠️ Không tìm thấy steam_discord_mapping.json');
        return {};
    }
    try {
        const raw = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf-8'));
        return Object.fromEntries(
            Object.entries(raw).map(([k, v]) => [extractZ(k), parseInt(v)])
        );
    } catch (e) {
        console.error('❌ Lỗi load mapping:', e);
        return {};
    }
}

function getPlaytimeDB() {
    if (!fs.existsSync(SQ3_PATH)) {
        console.warn('⚠️ Không tìm thấy sourcemod-local.sq3');
        return {};
    }
    return new Promise((resolve) => {
        const db = new sqlite3.Database(SQ3_PATH, sqlite3.OPEN_READONLY);
        db.all("SELECT steamid, minutes FROM playtime", [], (err, rows) => {
            db.close();
            if (err) {
                console.error('❌ Lỗi đọc playtime DB:', err);
                return resolve({});
            }
            const data = {};
            rows.forEach(row => {
                data[extractZ(row.steamid)] = row.minutes;
            });
            resolve(data);
        });
    });
}

async function getPlaytimeForUser(discordId) {
    const mapping = loadMapping();
    const playtimeDB = await getPlaytimeDB();
    const steamZ = Object.keys(mapping).find(z => mapping[z] === discordId);
    if (!steamZ) return null;
    return playtimeDB[steamZ] || 0;
}

function getRoleChanges(guild) {
    // PLAYTIME_ROLES giống hệt bot Python cũ của bạn
    const PLAYTIME_ROLES = [
        { hours: 5,    min_min: 300,    role_id: "1468536962611679362", name: "5 tiếng" },
        { hours: 20,   min_min: 1200,   role_id: "1468537240866258987", name: "20 tiếng" },
        { hours: 50,   min_min: 3000,   role_id: "1468537280494047289", name: "50 tiếng" },
        { hours: 100,  min_min: 6000,   role_id: "1468537312970281163", name: "100 tiếng" },
        { hours: 500,  min_min: 30000,  role_id: "1468537346713714772", name: "500 tiếng" },
        { hours: 1000, min_min: 60000,  role_id: "1468537374026895521", name: "1000 tiếng" },
        { hours: 2000, min_min: 120000, role_id: "1468539599193374750", name: "2000 tiếng" },
        { hours: 5000, min_min: 300000, role_id: "1468540038383140904", name: "5000 tiếng" }
    ];

    const mapping = loadMapping();
    const playtimeDB = {}; // sẽ được load async ở nơi gọi

    return {
        PLAYTIME_ROLES,
        async calculate(guild) {
            const dbData = await getPlaytimeDB();
            const changes = [];
            for (const [z, discordId] of Object.entries(mapping)) {
                const member = guild.members.cache.get(discordId);
                if (!member) continue;

                const minutes = dbData[z] || 0;
                const currentRole = member.roles.cache.find(r => PLAYTIME_ROLES.some(pr => pr.role_id === r.id));

                const newRoleData = PLAYTIME_ROLES
                    .slice()
                    .reverse()
                    .find(r => minutes >= r.min_min);

                if (newRoleData && (!currentRole || currentRole.id !== newRoleData.role_id)) {
                    changes.push({
                        member,
                        hours: Math.round(minutes / 60 * 10) / 10,
                        currentRole,
                        newRole: guild.roles.cache.get(newRoleData.role_id),
                        newRoleName: newRoleData.name
                    });
                }
            }
            return changes;
        }
    };
}

module.exports = {
    loadMapping,
    getPlaytimeDB,
    getPlaytimeForUser,
    getRoleChanges
};
