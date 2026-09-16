const http = require('http');
const mineflayer = require('mineflayer');

// 1. خادم ويب لإبقاء الخدمة حية ومستمرة على منصة Render
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('🤖 بوت هيروبرين (Java Offline) يعمل ويراقب السيرفر!');
}).listen(process.env.PORT || 3000);

// 2. إعدادات البوت لنظام الجافا المكرك (Cracked)
const botOptions = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058,       // منفذ السيرفر الموضح في لوحة Aternos
  username: 'Herobrine',
  auth: 'offline',   // إلغاء توثيق مايكروسوفت والدخول المباشر
  version: false     // اكتشاف إصدار السيرفر تلقائياً
};

function createBot() {
  console.log('----------------------------------------------------');
  console.log('🔄 [فحص الاتصال] جاري محاولة التوصيل بسيرفر Aternos (Java)...');

  const bot = mineflayer.createBot(botOptions);

  // عند الدخول المبدئي
  bot.on('login', () => {
    console.log('🎉 ✅ [تم الدخول بنجاح] هيروبرين متصل الآن بوضع الأوفلاين!');
  });

  // عند رسبنة البوت داخل العالم وتفعيل سكريبتات الرعب
  bot.on('spawn', () => {
    console.log('👻 هيروبرين متواجد داخل العالم وجاهز لنشر الرعب!');

    // أ) هالة البارتيكلز (تأثير لهب وشرار حول البوت)
    setInterval(() => {
      bot.chat('/execute at Herobrine run particle minecraft:flame ~ ~1 ~ 0.2 0.5 0.2 0.01 10');
      bot.chat('/execute at Herobrine run particle minecraft:lava ~ ~1.2 ~ 0.2 0.2 0.2 0.01 5');
    }, 1200);

    // ب) إلحاق الضرر باللاعبين القريبين منه (مسافة 3 بلوكات)
    setInterval(() => {
      bot.chat('/damage @a[distance=..3,name=!Herobrine] 4 entity_attack entity Herobrine');
    }, 1000);

    // ج) قدرات الرعب الدورية (كل 30 ثانية)
    setInterval(() => {
      // إعطاء تأثير الظلام والعمى للاعبين القريبين
      bot.chat('/effect give @a[distance=..15,name=!Herobrine] minecraft:darkness 6 1 true');
      bot.chat('/effect give @a[distance=..15,name=!Herobrine] minecraft:blindness 4 1 true');

      // تشغيل صراخ مرعب عند موقع اللاعبين
      bot.chat('/execute at @a run playsound minecraft:entity.ghast.scream master @s ~ ~ ~ 1 0.7');

      // الانتقال الفجائي (Teleport) خلف لاعب عشوائي
      bot.chat('/execute at @r[name=!Herobrine] run tp Herobrine ~ ~ ~-2');
    }, 30000);
  });

  // التفاعل مع الشات عند ذكر اسم Herobrine
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message.toLowerCase().includes('herobrine')) {
      bot.chat('I am always watching you...');
    }
  });

  // إدارة الأخطاء وإعادة الاتصال التلقائي
  bot.on('error', (err) => {
    console.log('❌ [خطأ في الاتصال]:', err.message || err);
  });

  bot.on('end', (reason) => {
    console.log('⚠️ [انقطع الاتصال]: السبب -', reason);
    console.log('🔄 سيتم إعادة المحاولة خلال 15 ثانية...\n');
    setTimeout(createBot, 15000);
  });
}

// تشغيل البوت
createBot();
