// commands/batthongbao.js
const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder().setName('batthongbao').setDescription('Bật thông báo mèo'),
    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });
        db.prepare('INSERT OR REPLACE INTO notifications (user_id, enabled) VALUES (?, 1)').run(interaction.user.id);
        await interaction.reply('✅ Đã **bật** thông báo mèo lúc 18:00 hàng ngày!');
    }
};

