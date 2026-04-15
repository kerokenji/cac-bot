// events/messageCreate.js
const db = require('../database');
const config = require('../config');
const { addXP } = require('../handlers/levelHandler');

module.exports = async (message, client) => {
    if (message.author.bot || !config.ALLOWED_GUILDS.includes(message.guild?.id)) return;

    const now = Date.now();
    const cooldownKey = `msg_${message.author.id}`;
    if (client.cooldowns?.has(cooldownKey) && now - client.cooldowns.get(cooldownKey) < 10000) return; // 10s cooldown mặc định

    // Tích điểm
    const pointsPerMsg = db.prepare('SELECT value FROM config WHERE key = "points_per_msg"').get()?.value || 2;
    let row = db.prepare('SELECT points FROM users WHERE user_id = ?').get(message.author.id);
    const currentPoints = row ? row.points : 0;
    db.prepare('INSERT OR REPLACE INTO users (user_id, points) VALUES (?, ?)').run(message.author.id, currentPoints + pointsPerMsg);

    // Tích XP chat
    await addXP(message.member, 'chat', 20, message.guild.id); // 20 XP chat mỗi tin nhắn

    // Set cooldown
    if (!client.cooldowns) client.cooldowns = new Map();
    client.cooldowns.set(cooldownKey, now);
};
