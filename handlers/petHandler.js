// handlers/petHandler.js
const db = require('../database');
const config = require('../config');

const CAT_PRICE = config.CAT_PRICE || 1500;

// Mua mèo mới
async function buyCat(userId, breed) {
    const pointsRow = db.prepare('SELECT points FROM users WHERE user_id = ?').get(userId);
    if (!pointsRow || pointsRow.points < CAT_PRICE) return { success: false, msg: '❌ Không đủ điểm!' };

    // Trừ điểm
    db.prepare('UPDATE users SET points = points - ? WHERE user_id = ?').run(CAT_PRICE, userId);

    // Tạo mèo
    const now = Math.floor(Date.now() / 1000);
    db.prepare(`
        INSERT OR REPLACE INTO pets (user_id, breed, last_fed, sickness, rabies_expire, mood)
        VALUES (?, ?, ?, 5, ?, 10)
    `).run(userId, breed, now, now + 30 * 24 * 3600); // tiêm dại sau 30 ngày

    return { success: true, msg: `✅ Bạn đã mua **${breed}** thành công!` };
}

// Cho ăn
function feedCat(userId) {
    const pet = db.prepare('SELECT * FROM pets WHERE user_id = ? AND death_date = 0').get(userId);
    if (!pet) return { success: false, msg: '❌ Bạn chưa có mèo!' };

    const now = Math.floor(Date.now() / 1000);
    db.prepare('UPDATE pets SET last_fed = ?, mood = MIN(mood + 2, 10), sickness = MAX(sickness - 10, 5) WHERE user_id = ?')
        .run(now, userId);

    return { success: true, msg: '🍖 Mèo đã được cho ăn! Tâm trạng tăng.' };
}

// Uống thuốc
function giveMedicine(userId) {
    const pet = db.prepare('SELECT * FROM pets WHERE user_id = ? AND death_date = 0').get(userId);
    if (!pet) return { success: false, msg: '❌ Bạn chưa có mèo!' };

    db.prepare('UPDATE pets SET sickness = MAX(sickness - 30, 5) WHERE user_id = ?').run(userId);
    return { success: true, msg: '💊 Mèo đã uống thuốc! Bệnh giảm mạnh.' };
}

// Tiêm dại
function vaccinateCat(userId) {
    const pet = db.prepare('SELECT * FROM pets WHERE user_id = ? AND death_date = 0').get(userId);
    if (!pet) return { success: false, msg: '❌ Bạn chưa có mèo!' };

    const now = Math.floor(Date.now() / 1000);
    db.prepare('UPDATE pets SET rabies_expire = ? WHERE user_id = ?').run(now + 30 * 24 * 3600, userId);
    return { success: true, msg: '💉 Mèo đã được tiêm dại! Hiệu lực 30 ngày.' };
}

// Chơi đùa
function playWithCat(userId) {
    const pet = db.prepare('SELECT * FROM pets WHERE user_id = ? AND death_date = 0').get(userId);
    if (!pet) return { success: false, msg: '❌ Bạn chưa có mèo!' };

    db.prepare('UPDATE pets SET mood = MIN(mood + 3, 10) WHERE user_id = ?').run(userId);
    return { success: true, msg: '🎾 Mèo vui vẻ hơn!' };
}

// Kiểm tra và cập nhật tình trạng mèo (gọi trong cron hoặc hàng ngày)
function updatePetStatus() {
    const now = Math.floor(Date.now() / 1000);
    const pets = db.prepare('SELECT * FROM pets WHERE death_date = 0').all();

    for (const pet of pets) {
        let changed = false;
        const hoursSinceFed = (now - pet.last_fed) / 3600;

        // Đói → tăng bệnh
        if (hoursSinceFed > 12) {
            pet.sickness = Math.min(pet.sickness + 20, 100);
            changed = true;
        }

        // Bệnh nặng → chết
        if (pet.sickness >= 100) {
            db.prepare('UPDATE pets SET death_date = ? WHERE user_id = ?').run(now, pet.user_id);
            continue;
        }

        // Tiêm dại hết hạn → có nguy cơ dại
        if (pet.rabies_expire && pet.rabies_expire < now) {
            pet.sickness = Math.min(pet.sickness + 15, 100);
            changed = true;
        }

        if (changed) {
            db.prepare('UPDATE pets SET sickness = ?, mood = MAX(mood - 1, 1) WHERE user_id = ?')
                .run(pet.sickness, pet.user_id);
        }
    }
}

module.exports = {
    buyCat,
    feedCat,
    giveMedicine,
    vaccinateCat,
    playWithCat,
    updatePetStatus
};
