// events/ready.js
const config = require('../config');
const db = require('../database');
const { startPetNotifications, startPlaytimeRoleCheck } = require('../utils/cron');
const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    console.log(`✅ Bot ${client.user.tag} đã online!`);

    // ================== LOAD TẤT CẢ COMMANDS ==================
    client.commands = new Map();

    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            if (command.data && typeof command.execute === 'function') {
                client.commands.set(command.data.name, command);
                console.log(`✅ Loaded command: /${command.data.name}`);
            } else {
                console.warn(`⚠️ Command ${file} thiếu data hoặc execute`);
            }
        } catch (error) {
            console.error(`❌ Lỗi load command ${file}:`, error.message);
        }
    }

    console.log(`📦 Tổng cộng đã load ${client.commands.size} slash commands.`);

    // ================== XÓA LỆNH CŨ & ĐĂNG KÝ LỆNH MỚI ==================
    for (const guildId of config.ALLOWED_GUILDS) {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
            console.log(`⚠️ Không tìm thấy guild ${guildId}`);
            continue;
        }

        try {
            console.log(`🗑️ Đang xóa toàn bộ slash commands cũ trong server ${guild.name}...`);
            await guild.commands.set([]);   // Xóa hết lệnh cũ
            console.log(`✅ Đã xóa sạch lệnh cũ!`);

            const commandsArray = Array.from(client.commands.values());
            await guild.commands.set(commandsArray.map(cmd => cmd.data.toJSON()));

            console.log(`✅ Đã đăng ký ${commandsArray.length} lệnh mới cho server ${guild.name}`);
        } catch (error) {
            console.error(`❌ Lỗi đăng ký commands cho ${guild.name}:`, error.message);
        }
    }

    // ================== KHỞI ĐỘNG CRON ==================
    startPetNotifications(client);
    startPlaytimeRoleCheck(client);

    // Khởi tạo config mặc định
    db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)').run('points_per_msg', 2);
    db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)').run('cooldown_sec', 10);

    console.log('🚀 Bot đã sẵn sàng sử dụng!');
};