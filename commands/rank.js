// commands/rank.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const db = require('../database');
const { generateRankCard } = require('../utils/canvas');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder().setName('rank').setDescription('Xem thẻ rank của bạn'),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });

        const chatRow = db.prepare('SELECT xp FROM levels_chat WHERE user_id = ?').get(interaction.user.id);
        const voiceRow = db.prepare('SELECT xp FROM levels_voice WHERE user_id = ?').get(interaction.user.id);

        const chatXP = chatRow ? chatRow.xp : 0;
        const voiceXP = voiceRow ? voiceRow.xp : 0;

        const chatLevel = Math.floor(chatXP / 1000); // ví dụ đơn giản, bạn có thể tinh chỉnh
        const voiceLevel = Math.floor(voiceXP / 1000);

        const tier = chatLevel >= 100 ? 'S' : chatLevel >= 70 ? 'A' : chatLevel >= 40 ? 'B' : chatLevel >= 20 ? 'C' : 'D';

        const buffer = await generateRankCard(interaction.member, chatLevel, voiceLevel, chatXP % 1000, voiceXP % 1000, tier);
        const attachment = new AttachmentBuilder(buffer, { name: 'rank.png' });

        await interaction.reply({ files: [attachment] });
    }
};
