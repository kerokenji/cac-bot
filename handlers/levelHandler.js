// handlers/levelHandler.js
const db = require('../database');
const { generateLevelUpImage } = require('../utils/canvas');
const config = require('../config');

const LEVEL_UP_CHANNEL = config.LEVEL_UP_CHANNEL_ID || null; // bạn có thể set sau

// Tính level (9999 cấp, càng cao càng khó)
function getLevel(xp) {
    return Math.floor(Math.pow(xp / 300, 0.4)); // công thức làm cho level cao khó lên dần
}

function getXPForLevel(level) {
    return Math.floor(300 * Math.pow(level, 2.5));
}

async function addXP(member, category, amount, guildId) {
    if (amount <= 0) return;

    const table = category === 'chat' ? 'levels_chat' : 'levels_voice';
    let row = db.prepare(`SELECT xp FROM ${table} WHERE user_id = ?`).get(member.id);
    const oldXP = row ? row.xp : 0;

    const newXP = oldXP + amount;
    db.prepare(`INSERT OR REPLACE INTO ${table} (user_id, xp) VALUES (?, ?)`).run(member.id, newXP);

    const oldLevel = getLevel(oldXP);
    const newLevel = getLevel(newXP);

    if (newLevel > oldLevel) {
        // Gửi level-up
        const channel = member.guild.channels.cache.get(LEVEL_UP_CHANNEL) || member.guild.systemChannel;
        if (channel) {
            const buffer = await generateLevelUpImage(member, oldLevel, newLevel, category.toUpperCase());
            const AttachmentBuilder = require('discord.js').AttachmentBuilder;
            const attachment = new AttachmentBuilder(buffer, { name: 'levelup.png' });
            await channel.send({
                content: `${member} đã lên **Level \( {newLevel}** ( \){category}) 🎉 GG!`,
                files: [attachment]
            });
        }

        // Có thể thêm role level ở đây sau
    }
}

module.exports = { addXP, getLevel };
