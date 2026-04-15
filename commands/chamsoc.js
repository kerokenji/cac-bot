// commands/chamsoc.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder().setName('chamsoc').setDescription('Chăm sóc mèo của bạn'),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });

        const pet = db.prepare('SELECT * FROM pets WHERE user_id = ? AND death_date = 0').get(interaction.user.id);
        if (!pet) return interaction.reply({ content: '❌ Bạn chưa có mèo nào!', ephemeral: true });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('feed_cat').setLabel('🍖 Cho ăn').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('medicine_cat').setLabel('💊 Uống thuốc').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('vaccine_cat').setLabel('💉 Tiêm dại').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('play_cat').setLabel('🎾 Chơi đùa').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            content: `🐱 **Mèo ${pet.breed}** của bạn đang chờ bạn chăm sóc!`,
            components: [row],
            ephemeral: true
        });
    }
};
