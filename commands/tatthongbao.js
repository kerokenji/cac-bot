// commands/tatthongbao.js
const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder().setName('tatthongbao').setDescription('Tắt thông báo mèo'),
    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });
        db.prepare('INSERT OR REPLACE INTO notifications (user_id, enabled) VALUES (?, 0)').run(interaction.user.id);
        await interaction.reply('✅ Đã **tắt** thông báo mèo!');
    }
};
