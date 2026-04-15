// commands/shop.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const db = require('../database');
const config = require('../config');

const CAT_BREEDS = [
    { name: 'Mèo Anh Lông Dài', value: 'anh-long-dai' },
    { name: 'Mèo Anh Lông Ngắn', value: 'anh-long-ngan' },
    { name: 'Mèo Ai Cập', value: 'ai-cap' },
    { name: 'Mèo Mướp Xám', value: 'muop-xam' },
    { name: 'Mèo Vàng', value: 'vang' },
    { name: 'Mèo Scottish Fold', value: 'scottish-fold' },
    { name: 'Mèo Mun', value: 'mun' },
    { name: 'Mèo Tam Thể', value: 'tam-the' },
    { name: 'Mèo Tuxedo', value: 'tuxedo' },
    { name: 'Mèo Xiêm', value: 'xiem' },
    { name: 'Mèo Ba Tư', value: 'ba-tu' },
    { name: 'Mèo Maine Coon', value: 'maine-coon' }
];

module.exports = {
    data: new SlashCommandBuilder().setName('shop').setDescription('Mở cửa hàng mèo 🐱'),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('shop_cats').setLabel('🐱 Tìm mua mèo').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('shop_food').setLabel('🍖 Thức ăn').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('shop_med').setLabel('💊 Thuốc & Tiêm').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('shop_toys').setLabel('🎾 Đồ chơi').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            content: '**🐾 Chào mừng đến với Cửa Hàng Mèo!**\nChọn danh mục bên dưới:',
            components: [row1],
            ephemeral: true
        });
    }
};
