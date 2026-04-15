// events/voiceStateUpdate.js
const { addXP } = require('../handlers/levelHandler');
const config = require('../config');

const activeVoices = new Map();

module.exports = async (oldState, newState) => {
    const member = newState.member;
    if (!member || !config.ALLOWED_GUILDS.includes(member.guild.id)) return;

    // Vào voice channel
    if (!oldState.channel && newState.channel?.type === 2) {
        activeVoices.set(member.id, Date.now());
    }

    // Rời voice channel
    if (oldState.channel && !newState.channel) {
        if (activeVoices.has(member.id)) {
            const joinTime = activeVoices.get(member.id);
            const timeSpent = (Date.now() - joinTime) / 1000 / 3600; // giờ
            const xpAdd = Math.floor(timeSpent * 100); // 100 XP/giờ, càng lâu càng khó lên level sau

            await addXP(member, 'voice', Math.max(1, xpAdd), member.guild.id);
            activeVoices.delete(member.id);
        }
    }
};
