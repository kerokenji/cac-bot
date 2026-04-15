// utils/cron.js
const cron = require('node-cron');
const { getPlaytimeForUser } = require('./playtimeUtils');
const db = require('../database');
const config = require('../config');
const { VN_TZ } = require('../config');

// ================== CRON JOBS ==================

// 1. Thông báo mèo mỗi ngày lúc 18:00 (6h tối) giờ VN
async function startPetNotifications(client) {
    console.log('⏰ Đã khởi động cron thông báo mèo lúc 18:00');

    cron.schedule('0 18 * * *', async () => {
        const now = Math.floor(Date.now() / 1000);
        const pets = db.prepare('SELECT * FROM pets WHERE death_date = 0').all();

        for (const pet of pets) {
            const userId = pet.user_id;
            const notif = db.prepare('SELECT enabled FROM notifications WHERE user_id = ?').get(userId);
            if (!notif || notif.enabled !== 1) continue;

            const member = await client.users.fetch(userId).catch(() => null);
            if (!member) continue;

            const hoursSinceFed = Math.floor((now - pet.last_fed) / 3600);

            let message = `🐱 **Mèo của bạn (${pet.breed})** đang có tình trạng:\n`;

            if (hoursSinceFed >= 12) {
                message += `🍖 **Đói** (chưa ăn ${hoursSinceFed} tiếng)\n`;
            }
            if (pet.sickness > 5) {
                message += `💊 **Bị bệnh** (tỷ lệ: ${pet.sickness.toFixed(1)}%)\n`;
            }
            if (pet.rabies_expire && pet.rabies_expire < now) {
                message += `🩸 **Đã đến hạn tiêm dại**\n`;
            }

            if (message.includes('Đói') || message.includes('Bị bệnh') || message.includes('tiêm dại')) {
                try {
                    await member.send(message + `\nDùng lệnh \`/chamsoc\` để chăm sóc ngay nhé!`);
                } catch (e) {
                    // User tắt DM
                }
            }
        }
    }, {
        timezone: VN_TZ
    });
}

// 2. Kiểm tra role playtime mỗi 30 phút (tùy chọn, bạn có thể chạy thủ công qua /admin caprole)
function startPlaytimeRoleCheck(client) {
    console.log('⏰ Đã khởi động cron kiểm tra role playtime mỗi 30 phút');

    cron.schedule('*/30 * * * *', async () => {
        const guild = client.guilds.cache.get(config.ALLOWED_GUILDS[0]);
        if (!guild) return;

        const { getRoleChanges } = require('./playtimeUtils');
        const roleHandler = getRoleChanges(guild);
        const changes = await roleHandler.calculate(guild);

        if (changes.length === 0) return;

        const announceChannel = guild.channels.cache.get(config.ANNOUNCE_CHANNEL_ID);
        for (const change of changes) {
            try {
                if (change.currentRole) await change.member.roles.remove(change.currentRole);
                await change.member.roles.add(change.newRole);

                if (announceChannel) {
                    announceChannel.send(
                        `🎉 **\( {change.member}** đã đạt ** \){change.newRoleName}** (${change.hours} giờ chơi)!`
                    );
                }
            } catch (e) {}
        }
    });
}

module.exports = {
    startPetNotifications,
    startPlaytimeRoleCheck
};
