// events/ready.js
const config = require('../config');
const db = require('../database');
const { startPetNotifications, startPlaytimeRoleCheck } = require('../utils/cron');

module.exports = async (client) => {
    console.log(`✅ Bot ${client.user.tag} đã online và sẵn sàng!`);

    // Khởi động cron jobs
    startPetNotifications(client);
    startPlaytimeRoleCheck(client);

    // Đăng ký slash commands (chỉ chạy 1 lần khi bot online)
    const commands = client.commands || [];
    if (commands.length > 0) {
        for (const guildId of config.ALLOWED_GUILDS) {
            const guild = client.guilds.cache.get(guildId);
            if (guild) {
                await guild.commands.set(commands.map(cmd => cmd.data.toJSON()));
                console.log(`✅ Slash commands đã đăng ký cho server ${guildId}`);
            }
        }
    }

    // Khởi tạo config mặc định nếu chưa có
    db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)').run('points_per_msg', config.DEFAULT_POINT_PER_MSG);
    db.prepare('INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)').run('cooldown_sec', config.DEFAULT_COOLDOWN_SEC);
};
