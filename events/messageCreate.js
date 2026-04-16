// events/messageCreate.js
const db = require('../database');
const config = require('../config');
const { addXP } = require('../handlers/levelHandler');

module.exports = async (message, client) => {
    if (message.author.bot || !config.ALLOWED_GUILDS.includes(message.guild?.id)) return;

    // ================== BỎ QUA LỆNH !pta (không phản hồi gì) ==================
    if (message.content.toLowerCase().trim().startsWith('!pta')) {
        return; // Không làm gì cả, tránh spam và crash
    }

    const now = Date.now();
    const cooldownKey = `msg_${message.author.id}`;

    // Kiểm tra cooldown tin nhắn
    if (client.cooldowns?.has(cooldownKey) && now - client.cooldowns.get(cooldownKey) < 10000) {
        return;
    }

    // ================== TÍCH ĐIỂM AN TOÀN ==================
    let pointsPerMsg = 2; // giá trị mặc định
    try {
        const row = db.prepare('SELECT value FROM config WHERE key = "points_per_msg"').get();
        if (row && row.value !== null) {
            pointsPerMsg = parseInt(row.value);
        }
    } catch (e) {
        console.warn('⚠️ Không đọc được config points_per_msg, dùng mặc định 2');
    }

    // Lấy điểm hiện tại
    let userRow = db.prepare('SELECT points FROM users WHERE user_id = ?').get(message.author.id);
    const currentPoints = userRow ? userRow.points : 0;

    // Cộng điểm
    db.prepare('INSERT OR REPLACE INTO users (user_id, points) VALUES (?, ?)')
        .run(message.author.id, currentPoints + pointsPerMsg);

    // Tích XP chat
    await addXP(message.member, 'chat', 20, message.guild.id);

    // Set cooldown
    if (!client.cooldowns) client.cooldowns = new Map();
    client.cooldowns.set(cooldownKey, now);
};