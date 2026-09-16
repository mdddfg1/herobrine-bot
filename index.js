const http = require('http');
const mineflayer = require('mineflayer');

// 1. خادم ويب لإبقاء الخدمة حية ومستمرة على منصة Render
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('🤖 بوت هيروبرين (Java Offline) يعمل ويراقب السيرفر!');
}).listen(process.env.PORT || 3000);

// 2. إعدادات الاتصال بالسيرفر
const botOptions = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058,
  username: 'Herobrine',
  auth: 'offline',
  version: '1.21'
};

function createBot() {
  console.log('----------------------------------------------------');
  console.log('🔄 [فحص الاتصال] جاري محاولة التوصيل بسيرفر Spigot (1.21)...');

  const bot = mineflayer.createBot(botOptions);

  bot.on('login', () => {
    console.log('🎉 ✅ [تم الدخول بنجاح] هيروبرين متصل الآن بوضع الأوفلاين!');
  });

  bot.on('spawn', () => {
    console.log('👻 هيروبرين متواجد داخل العالم وجاهز لنشر الرعب!');

    // 1. هالة البارتيكلز
    setInterval(() => {
      bot.chat('/execute at Herobrine run particle minecraft:flame ~ ~1 ~ 0.2 0.5 0.2 0.01 10');
      bot.chat('/execute at Herobrine run particle minecraft:lava ~ ~1.2 ~ 0.2 0.2 0.2 0.01 5');
    }, 1200);

    // 2. إلحاق الضرر باللاعبين القريبين (3 بلوكات)
    setInterval(() => {
      bot.chat('/damage @a[distance=..3,name=!Herobrine] 4 entity_attack entity Herobrine');
    }, 1000);

    // 3. قدرات الرعب الدورية (كل 30 ثانية)
    setInterval(() => {
      bot.chat('/effect give @a[distance=..15,name=!Herobrine] minecraft:darkness 6 1 true');
      bot.chat('/effect give @a[distance=..15,name=!Herobrine] minecraft:blindness 4 1 true');
      bot.chat('/execute at @a run playsound minecraft:entity.ghast.scream master @s ~ ~ ~ 1 0.7');
      bot.chat('/execute at @r[name=!Herobrine] run tp Herobrine ~ ~ ~-2');
    }, 30000);
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message.toLowerCase().includes('herobrine')) {
      bot.chat('I am always watching you...');
    }
  });

  // 4. معالجة الأخطاء وطباعة تفاصيل ورقم الخطأ بالكامل
  bot.on('error', (err) => {
    console.log('❌ ================= [تفاصيل الخطأ] =================');
    console.log('📌 رمز الخطأ (Code):', err.code || 'غير متوفر');
    console.log('🔢 رقم النظام (Errno):', err.errno || 'غير متوفر');
    console.log('⚙️ الأمر (Syscall):', err.syscall || 'غير متوفر');
    console.log('📝 الرسالة (Message):', err.message || err);
    console.log('🔍 الكائن كامل (Full Error):', err);
    console.log('====================================================');
  });

  bot.on('end', (reason) => {
    console.log('⚠️ [انقطع الاتصال]: السبب -', reason);
    console.log('🔄 سيتم إعادة المحاولة خلال 15 ثانية...\n');
    setTimeout(createBot, 15000);
  });
}

// التقاط أي أخطاء غير متوقعة في التطبيق لمنع توقفه المفاجئ
process.on('uncaughtException', (err) => {
  console.log('🚨 [استثناء غير معالج]:', err.code || err.message, err);
});

createBot();
