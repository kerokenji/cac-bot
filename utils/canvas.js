const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function generateRankCard(member, chatLevel, voiceLevel, chatXP, voiceXP, tier) {
  const canvas = createCanvas(700, 280);
  const ctx = canvas.getContext('2d');

  // Background từ ảnh rank_template.png bạn gửi
  const bg = await loadImage(path.join(__dirname, '../assets/rank_template.png'));
  ctx.drawImage(bg, 0, 0, 700, 280);

  // Avatar
  const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
  ctx.save();
  ctx.beginPath();
  ctx.arc(100, 140, 70, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, 30, 70, 140, 140);
  ctx.restore();

  // Tier (S A B C D)
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 60px sans-serif';
  ctx.fillText(tier, 280, 110);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(`CHAT LV ${chatLevel}`, 280, 170);
  ctx.fillText(`VOICE LV ${voiceLevel}`, 280, 210);

  // Progress bar chat
  const chatPercent = (chatXP % 1000) / 1000;
  ctx.fillStyle = '#3A3C40';
  ctx.fillRect(280, 230, 380, 28);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(280, 230, 380 * chatPercent, 28);

  return canvas.toBuffer('image/png');
}

async function generateLevelUpImage(member, oldLevel, newLevel, category) {
  const canvas = createCanvas(600, 200);
  const ctx = canvas.getContext('2d');
  const bg = await loadImage(path.join(__dirname, '../assets/levelup_template.png'));
  ctx.drawImage(bg, 0, 0, 600, 200);

  const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
  ctx.save();
  ctx.beginPath();
  ctx.arc(100, 100, 70, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, 30, 30, 140, 140);
  ctx.restore();

  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 55px sans-serif';
  ctx.fillText('Level-up!', 230, 95);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText(`${oldLevel} → ${newLevel} ${category}`, 230, 155);

  return canvas.toBuffer('image/png');
}

module.exports = { generateRankCard, generateLevelUpImage };
