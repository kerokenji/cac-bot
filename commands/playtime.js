// commands/playtime.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPlaytimeForUser } = require('../utils/playtimeUtils');
const config = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playtime')
        .setDescription('Xem thời gian chơi của bạn hoặc người khác')
        .addUserOption(opt => opt.setName('người').setDescription('Người cần xem (để trống = bạn)')),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) {
            return interaction.reply({ content: '❌ Bot chỉ hoạt động trên server được phép!', ephemeral: true });
        }

        const target = interaction.options.getUser('người') || interaction.user;
        const minutes = await getPlaytimeForUser(target.id);

        if (minutes === null) {
            return interaction.reply({ content: `❌ ${target} chưa liên kết Steam với Discord.`, ephemeral: true });
        }

        const hours = (minutes / 60).toFixed(1);
        const embed = new EmbedBuilder()
            .setColor(0x43b581)
            .setDescription(`**Người chơi**: ${target}\n**Giờ chơi**: \( {hours} giờ ( \){minutes} phút)`)
            .setFooter({ text: 'Dữ liệu lấy từ sourcemod-local.sq3' });

        await interaction.reply({ embeds: [embed] });
    }
};
