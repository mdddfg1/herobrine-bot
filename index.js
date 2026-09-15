const http = require('http');
const mineflayer = require('mineflayer');

// رابط Aternos (رابط إضافة/دعوة)
// هذا الرابط مفيد للمشاركة لكن ليس هو المضيف المباشر الذي يحتاجه mineflayer للاتصال.
const ATERNOS_INVITE = process.env.ATERNOS_INVITE || 'https://add.aternos.org/SERAJ_ABDO2';

// خادم وهمي لإبقاء موقع Render/Heroku شغالاً
http.createServer((req, res) => res.end('Herobrine is online!')).listen(process.env.PORT || 52058);

// إعدادات دخول البوت - غيّر المتغيرات البيئية أو استبدل القيم هنا
const bot = mineflayer.createBot({
  host: process.env.MC_HOST || 'SERAJ_ABDO2.aternos.me', // تم تعيين مضيف Aternos الذي أعطيته
  port: Number(process.env.MC_PORT) || 25565,                            // البورت الخاص بك
  username: process.env.MC_USERNAME || 'Herobrine'
});

bot.on('spawn', () => {
  console.log('✅ دخل هيروبرين إلى السيرفر!');
  console.log('🔗 Aternos invite link:', ATERNOS_INVITE);
  console.log('ℹ️ Note: The invite link is for adding/joining the server on Aternos; mineflayer needs the server host (e.g. my-server.aternos.me) which is set above.');
});

// سلوك هيروبرين (المراقبة والاختفاء عند الاقتراب)
bot.on('physicTick', () => {
  if (!bot.entity) return; // تأكد أن بيانات الكيان متاحة
  const filter = e => e.type === 'player' && e.username !== bot.username;
  const player = bot.nearestEntity(filter);

  if (player) {
    // حاول النظر إلى اللاعب (التجاهل إذا فشل)
    try { bot.lookAt(player.position.offset(0, player.height, 0)); } catch (e) {}

    const distance = bot.entity.position.distanceTo(player.position);

    if (distance < 5) {
      bot.chat('I see you...');
      bot.quit(); // الخروج فوراً لإيهام اللاعب بالإختفاء
    }
  }
});

// لوج الأخطاء وإعادة المحاولة البسيطة
bot.on('error', err => console.error('Bot error:', err));
bot.on('end', () => console.log('Bot disconnected'));
