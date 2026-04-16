// commands/playtime.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlaytimeForUser } = require('../utils/playtimeUtils');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playtime')
        .setDescription('Xem thời gian chơi')
        .addUserOption(opt => opt.setName('người').setDescription('Người cần xem (để trống là bạn)')),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) {
            return interaction.reply({ content: '❌ Bot chỉ hoạt động trên server được phép!', ephemeral: true });
        }

        const target = interaction.options.getUser('người') || interaction.user;
        const isSelf = (target.id === interaction.user.id);

        const result = await getPlaytimeForUser(target.id);

        let description = '';
        if (!result.success) {
            description = `${isSelf ? 'Bạn' : target} chưa liên kết Steam với Discord.`;
        } else {
            description = `**Người chơi**: ${target}\n**Giờ chơi**: ${result.hours} giờ (${result.minutes} phút)`;
        }

        const embed = new EmbedBuilder()
            .setColor(result.success ? 0x43b581 : 0xFF0000)
            .setDescription(description)
            .setFooter({ text: 'Dữ liệu lấy từ L4D2' });

        await interaction.reply({ embeds: [embed] });
    }
};