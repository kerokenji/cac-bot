// commands/admin.js
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../database');
const config = require('../config');
const { loadMapping, getPlaytimeDB, getRoleChanges } = require('../utils/playtimeUtils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Lệnh admin')
        .addSubcommand(sub => sub
            .setName('point')
            .setDescription('Cộng hoặc trừ điểm')
            .addUserOption(opt => opt.setName('người').setDescription('Người nhận').setRequired(true))
            .addIntegerOption(opt => opt.setName('số').setDescription('Số điểm (+ cộng, - trừ)').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('setup')
            .setDescription('Cài đặt point hoặc cooldown')
            .addStringOption(opt => opt.setName('type').setDescription('Loại cài đặt').setRequired(true)
                .addChoices(
                    { name: 'point', value: 'point' },
                    { name: 'cooldown', value: 'cooldown' }
                ))
            .addIntegerOption(opt => opt.setName('giá_trị').setDescription('Giá trị').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('pta')
            .setDescription('Xem toàn bộ giờ chơi toàn server (giống !pta)'))
        .addSubcommand(sub => sub
            .setName('checkrole')
            .setDescription('Kiểm tra ai cần nâng role'))
        .addSubcommand(sub => sub
            .setName('caprole')
            .setDescription('Cấp role playtime'))
        .addSubcommand(sub => sub
            .setName('clearcommands')
            .setDescription('Xóa hết slash commands cũ')),

    async execute(interaction) {
        if (!config.ALLOWED_GUILDS.includes(interaction.guild.id)) {
            return interaction.reply({ content: '❌ Server không được phép!', ephemeral: true });
        }

        if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator) && interaction.user.id !== config.OWNER_ID) {
            return interaction.reply({ content: '❌ Chỉ Admin hoặc Owner mới dùng được!', ephemeral: true });
        }

        const sub = interaction.options.getSubcommand();

        // ====================== /admin pta - GIỐNG HỆT !pta ======================
        if (sub === 'pta') {
            const mapping = loadMapping();
            const playtimeDB = getPlaytimeDB();

            const data_list = [];
            for (const [z, discordId] of Object.entries(mapping)) {
                const member = interaction.guild.members.cache.get(String(discordId));
                if (!member) continue;

                const minutes = playtimeDB[z] || 0;
                const hours = (minutes / 60).toFixed(1);
                data_list.push({
                    name: member.displayName,
                    minutes: minutes,
                    hours: hours
                });
            }

            // Sort cao → thấp
            data_list.sort((a, b) => b.minutes - a.minutes);

            if (data_list.length === 0) {
                return interaction.reply('Hiện chưa có dữ liệu giờ chơi nào.');
            }

            let text = '**Danh sách giờ chơi toàn server (cao → thấp)**\n\n';
            data_list.forEach((item, i) => {
                text += `\( {i + 1}. ** \){item.name}** - \( {item.hours} giờ ( \){item.minutes} phút)\n`;
            });

            // Footer giống bot cũ
            const lastUpdate = `Cập nhật lần cuối: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`;

            const embed = new EmbedBuilder()
                .setDescription(text)
                .setColor(0x7289da)
                .setFooter({ text: lastUpdate });

            return interaction.reply({ embeds: [embed] });
        }

        // ====================== POINT ======================
        if (sub === 'point') {
            const user = interaction.options.getUser('người');
            const amount = interaction.options.getInteger('số');
            const current = db.prepare('SELECT points FROM users WHERE user_id = ?').get(user.id)?.points || 0;
            db.prepare('INSERT OR REPLACE INTO users (user_id, points) VALUES (?, ?)').run(user.id, current + amount);
            return interaction.reply(`✅ Đã \( {amount >= 0 ? 'cộng' : 'trừ'} ** \){Math.abs(amount)} điểm** cho ${user}.`);
        }

        // ====================== SETUP ======================
        if (sub === 'setup') {
            const type = interaction.options.getString('type');
            const value = interaction.options.getInteger('giá_trị');
            const key = type === 'point' ? 'points_per_msg' : 'cooldown_sec';
            db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, value);
            return interaction.reply(`✅ Đã set **\( {type}** = ** \){value}**`);
        }

        // ====================== CHECKROLE ======================
        if (sub === 'checkrole') {
            const changes = getRoleChanges(interaction.guild);
            if (changes.length === 0) return interaction.reply('✅ Không có ai cần nâng role lúc này!');

            let text = '**📋 Danh sách cần nâng role:**\n\n';
            changes.forEach(c => {
                const curr = c.currentRole ? c.currentRole.name : 'Chưa có';
                text += `• **\( {c.member.displayName}** ( \){c.hours} giờ) — \`\( {curr}\` → ** \){c.newRoleName}**\n`;
            });
            return interaction.reply(text);
        }

        // ====================== CAPROLE ======================
        if (sub === 'caprole') {
            const changes = getRoleChanges(interaction.guild);
            if (changes.length === 0) return interaction.reply('✅ Không có ai cần thay đổi role.');

            await interaction.reply(`🔄 Đang cấp role cho **${changes.length}** người...`);

            for (const c of changes) {
                try {
                    if (c.currentRole) await c.member.roles.remove(c.currentRole);
                    await c.member.roles.add(c.newRole);
                } catch (e) {}
            }
            return interaction.followUp(`✅ Hoàn tất! Đã cấp role cho ${changes.length} người.`);
        }

        // ====================== CLEAR COMMANDS ======================
        if (sub === 'clearcommands') {
            await interaction.guild.commands.set([]);
            return interaction.reply('✅ Đã xóa sạch tất cả slash commands cũ!');
        }
    }
};