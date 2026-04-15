// commands/kiemtrameo.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder().setName('kiemtrameo').setDescription('Kiểm tra tình trạng mèo'),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });

        const pet = db.prepare('SELECT * FROM pets WHERE user_id = ? AND death_date = 0').get(interaction.user.id);
        if (!pet) return interaction.reply({ content: '❌ Bạn chưa sở hữu mèo nào!', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle(`🐱 ${pet.breed}`)
            .setColor(0xFF69B4)
            .addFields(
                { name: 'Tâm trạng', value: `${pet.mood}/10 ❤️`, inline: true },
                { name: 'Tỷ lệ bệnh', value: `${pet.sickness.toFixed(1)}%`, inline: true },
                { name: 'Đã tiêm dại', value: pet.rabies_expire ? '✅ Có' : '❌ Chưa', inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    }
};
