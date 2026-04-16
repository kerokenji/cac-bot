// events/interactionCreate.js
const { getRoleChanges } = require('../utils/playtimeUtils');
const { buyCat, feedCat, giveMedicine, vaccinateCat, playWithCat } = require('../handlers/petHandler');
const db = require('../database');
const config = require('../config');

module.exports = async (interaction, client) => {
    if (!interaction.isChatInputCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;

    if (!config.ALLOWED_GUILDS.includes(interaction.guild?.id)) {
        return interaction.reply({ content: '❌ Bot chỉ hoạt động trên server được phép!', ephemeral: true });
    }

    // ====================== SLASH COMMANDS ======================
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ Có lỗi xảy ra khi thực hiện lệnh!', 
                ephemeral: true 
            });
        }
        return;
    }

    // ====================== BUTTON & SELECT MENU ======================
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
        const customId = interaction.customId;

        // Shop - Mua mèo
        if (customId === 'shop_cats') {
            const breeds = [
                { label: 'Mèo Anh Lông Dài', value: 'anh-long-dai' },
                { label: 'Mèo Anh Lông Ngắn', value: 'anh-long-ngan' },
                { label: 'Mèo Ai Cập', value: 'ai-cap' },
                { label: 'Mèo Mướp Xám', value: 'muop-xam' },
                { label: 'Mèo Vàng', value: 'vang' },
                { label: 'Mèo Scottish Fold', value: 'scottish-fold' },
                { label: 'Mèo Mun', value: 'mun' },
                { label: 'Mèo Tam Thể', value: 'tam-the' },
                { label: 'Mèo Tuxedo', value: 'tuxedo' },
                { label: 'Mèo Xiêm', value: 'xiem' },
                { label: 'Mèo Ba Tư', value: 'ba-tu' },
                { label: 'Mèo Maine Coon', value: 'maine-coon' }
            ];

            const select = {
                type: 3, // String Select Menu
                custom_id: 'select_cat_to_buy',
                placeholder: 'Chọn giống mèo muốn mua',
                options: breeds
            };

            await interaction.update({
                content: '🐱 **Chọn giống mèo bạn muốn mua** (giá 1500 điểm):',
                components: [{ type: 1, components: [select] }]
            });
            return;
        }

        // Xử lý chọn mèo để mua
        if (customId === 'select_cat_to_buy') {
            const breedValue = interaction.values[0];
            const breedName = breedValue.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');

            const row = {
                type: 1,
                components: [
                    { type: 2, style: 3, label: '✅ Mua', custom_id: `buy_cat_${breedValue}` },
                    { type: 2, style: 4, label: '❌ Hủy', custom_id: 'cancel_buy' }
                ]
            };

            await interaction.update({
                content: `Bạn chắc chắn muốn mua **${breedName}** với giá **1500 điểm** không?`,
                components: [row]
            });
            return;
        }

        // Xác nhận mua mèo
        if (customId.startsWith('buy_cat_')) {
            const breedValue = customId.replace('buy_cat_', '');
            const breedName = breedValue.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            const result = await buyCat(interaction.user.id, breedName);

            if (result.success) {
                await interaction.update({ 
                    content: result.msg, 
                    components: [] 
                });
            } else {
                await interaction.update({ 
                    content: result.msg, 
                    components: [] 
                });
            }
            return;
        }

        if (customId === 'cancel_buy') {
            await interaction.update({ 
                content: '✅ Đã hủy việc mua mèo.', 
                components: [] 
            });
            return;
        }

        // Chăm sóc mèo - Cho ăn
        if (customId === 'feed_cat') {
            const result = feedCat(interaction.user.id);
            await interaction.reply({ content: result.msg, ephemeral: true });
        }

        // Uống thuốc
        if (customId === 'medicine_cat') {
            const result = giveMedicine(interaction.user.id);
            await interaction.reply({ content: result.msg, ephemeral: true });
        }

        // Tiêm dại
        if (customId === 'vaccine_cat') {
            const result = vaccinateCat(interaction.user.id);
            await interaction.reply({ content: result.msg, ephemeral: true });
        }

        // Chơi đùa
        if (customId === 'play_cat') {
            const result = playWithCat(interaction.user.id);
            await interaction.reply({ content: result.msg, ephemeral: true });
        }
    }
};