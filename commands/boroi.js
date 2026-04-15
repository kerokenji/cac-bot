// commands/boroi.js
const { SlashCommandBuilder } = require('discord.js');
const db = require('../database');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder().setName('boroi').setDescription('Bỏ rơi mèo (gửi vào trại)'),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });

        const pet = db.prepare('SELECT * FROM pets WHERE user_id = ? AND death_date = 0').get(interaction.user.id);
        if (!pet) return interaction.reply({ content: '❌ Bạn không có mèo để bỏ rơi!', ephemeral: true });

        db.prepare('UPDATE pets SET death_date = ? WHERE user_id = ?').run(Math.floor(Date.now()/1000), interaction.user.id);
        db.prepare('UPDATE notifications SET enabled = 0 WHERE user_id = ?').run(interaction.user.id);

        await interaction.reply(`😢 Bạn đã bỏ rơi **${pet.breed}**. Mèo đã được gửi vào trại nuôi.`);
    }
};
