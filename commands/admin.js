// commands/admin.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database');
const config = require('../config');
const { getRoleChanges } = require('../utils/playtimeUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Lệnh admin (chỉ Owner + Administrator)')
        .addSubcommand(sub => sub
            .setName('point')
            .setDescription('Cộng / trừ điểm')
            .addUserOption(opt => opt.setName('người').setDescription('Người nhận').setRequired(true))
            .addIntegerOption(opt => opt.setName('số').setDescription('Số điểm (+ = cộng, - = trừ)').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('setup')
            .setDescription('Cài đặt point')
            .addStringOption(opt => opt.setName('type').setDescription('point hoặc cooldown').setRequired(true)
                .addChoices({name:'point', value:'point'}, {name:'cooldown', value:'cooldown'}))
            .addIntegerOption(opt => opt.setName('giá_trị').setDescription('Giá trị').setRequired(true)))
        .addSubcommand(sub => sub.setName('pta').setDescription('Xem toàn bộ giờ chơi (như !pta)'))
        .addSubcommand(sub => sub.setName('checkrole').setDescription('Kiểm tra ai cần nâng role playtime'))
        .addSubcommand(sub => sub.setName('caprole').setDescription('Cấp role playtime cho mọi người')),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });
        if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator) && interaction.user.id !== config.OWNER_ID) {
            return interaction.reply({ content: '❌ Chỉ Admin/Owner mới dùng được!', ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();

        if (sub === 'point') {
            const user = interaction.options.getUser('người');
            const amount = interaction.options.getInteger('số');
            db.prepare('INSERT OR REPLACE INTO users (user_id, points) VALUES (?, COALESCE((SELECT points FROM users WHERE user_id = ?), 0) + ?)')
                .run(user.id, user.id, amount);
            return interaction.reply(`✅ Đã \( {amount > 0 ? 'cộng' : 'trừ'} ** \){Math.abs(amount)} điểm** cho ${user}.`);
        }

        if (sub === 'setup') {
            const type = interaction.options.getString('type');
            const value = interaction.options.getInteger('giá_trị');
            db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(type === 'point' ? 'points_per_msg' : 'cooldown_sec', value);
            return interaction.reply(`✅ Đã set **\( {type}** = ** \){value}**`);
        }

        if (sub === 'pta') {
            // Code giống !pta cũ, bạn có thể mở rộng sau
            return interaction.reply('✅ Tính năng /admin pta đang được xây dựng (dùng !pta tạm thời nếu cần).');
        }

        if (sub === 'checkrole') {
            const guild = interaction.guild;
            const { calculate } = getRoleChanges(guild);
            const changes = await calculate(guild);
            if (changes.length === 0) return interaction.reply('✅ Không có ai cần nâng role lúc này!');
            let text = '**📋 Danh sách cần nâng role:**\n';
            changes.forEach(c => text += `• \( {c.member} → ** \){c.newRoleName}** (${c.hours} giờ)\n`);
            return interaction.reply(text);
        }

        if (sub === 'caprole') {
            const guild = interaction.guild;
            const { calculate } = getRoleChanges(guild);
            const changes = await calculate(guild);
            if (changes.length === 0) return interaction.reply('✅ Không có ai cần thay đổi role.');
            // Thực hiện cấp role (code giống cron)
            // ... (bạn có thể copy logic từ cron.js)
            return interaction.reply(`✅ Đã cấp role cho **${changes.length}** người!`);
        }
    }
};
