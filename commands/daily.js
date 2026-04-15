// commands/daily.js
const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const config = require('../config');

const rewards = [11, 50, 100, 1000, 2000, 3000];
const weights = [70, 20, 8, 1, 0.6, 0.4];

module.exports = {
    data: new SlashCommandBuilder().setName('daily').setDescription('Nhận quà hằng ngày (reset 00:00 VN)'),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });

        const today = new Date().toLocaleDateString('vi-VN', { timeZone: config.VN_TZ });
        const last = db.prepare('SELECT last_date FROM dailies WHERE user_id = ?').get(interaction.user.id);

        if (last && last.last_date === today) {
            return interaction.reply({ content: '❌ Bạn đã nhận daily hôm nay rồi! Hãy quay lại sau 00:00.', ephemeral: true });
        }

        const pts = rewards[Math.floor(Math.random() * rewards.length)]; // weighted random có thể cải tiến sau
        const current = db.prepare('SELECT points FROM users WHERE user_id = ?').get(interaction.user.id)?.points || 0;

        db.prepare('INSERT OR REPLACE INTO users (user_id, points) VALUES (?, ?)').run(interaction.user.id, current + pts);
        db.prepare('INSERT OR REPLACE INTO dailies (user_id, last_date) VALUES (?, ?)').run(interaction.user.id, today);

        let msg = `🎁 **Nhận quà daily thành công!** Bạn được **${pts} điểm**!`;
        if (pts >= 1000) msg += ' 🔥 **TRÚNG LỚN!!!**';

        await interaction.reply(msg);
    }
};
