// commands/tangqua.js
const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tangqua')
        .setDescription('Tặng điểm cho người khác')
        .addUserOption(opt => opt.setName('người').setDescription('Người nhận').setRequired(true))
        .addIntegerOption(opt => opt.setName('số').setDescription('Số điểm tặng').setRequired(true)),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });

        const target = interaction.options.getUser('người');
        const amount = interaction.options.getInteger('số');

        if (amount <= 0) return interaction.reply({ content: '❌ Số điểm phải > 0!', ephemeral: true });

        const senderPoints = db.prepare('SELECT points FROM users WHERE user_id = ?').get(interaction.user.id)?.points || 0;
        if (senderPoints < amount) return interaction.reply({ content: '❌ Bạn không đủ điểm!', ephemeral: true });

        // Trừ người tặng
        db.prepare('INSERT OR REPLACE INTO users (user_id, points) VALUES (?, ?)')
            .run(interaction.user.id, senderPoints - amount);

        // Cộng người nhận
        const targetPoints = db.prepare('SELECT points FROM users WHERE user_id = ?').get(target.id)?.points || 0;
        db.prepare('INSERT OR REPLACE INTO users (user_id, points) VALUES (?, ?)')
            .run(target.id, targetPoints + amount);

        await interaction.reply(`✅ **\( {interaction.user}** đã tặng ** \){amount} điểm** cho ${target}!`);
    }
};
