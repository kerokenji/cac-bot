// commands/point.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('point')
        .setDescription('Xem số điểm của bạn hoặc người khác')
        .addUserOption(opt => opt.setName('người').setDescription('Người cần xem (để trống = bạn)')),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) {
            return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });
        }

        const target = interaction.options.getUser('người') || interaction.user;

        const row = db.prepare('SELECT points FROM users WHERE user_id = ?').get(target.id);
        const points = row ? row.points : 0;

        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setDescription(`**${target}** hiện có **${points} điểm** 🪙`);

        await interaction.reply({ embeds: [embed] });
    }
};