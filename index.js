const http = require('http');
const mineflayer = require('mineflayer');

// خادم ويب لإبقاء الخدمة حية ومستمرة على منصة Render
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('🤖 بوت هيروبرين (Java Edition) يعمل ويراقب السيرفر!');
}).listen(process.env.PORT || 3000);

// إعدادات البوت لسيرفر الجافا
const botOptions = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058, // المنفذ الموضح في صفحة Aternos
  username: 'Herobrine',
  auth: 'microsoft', // توثيق مايكروسوفت لنسخة الجافا
  profilesFolder: './msa_java_folder'
};

function createBot() {
  console.log('----------------------------------------------------');
  console.log('🔄 [فحص الاتصال] جاري محاولة التوصيل بسيرفر Aternos (Java)...');

  const bot = mineflayer.createBot(botOptions);

  // عند تسجيل الدخول بنجاح
  bot.on('login', () => {
    console.log('🎉 ✅ [تم الدخول بنجاح] هيروبرين متصل الآن داخل سيرفر الجافا!');
  });

  // عند رسبنة البوت داخل العالم وتفعيل سكريبتات الرعب
  bot.on('spawn', () => {
    console.log('👻 هيروبرين موجود الآن في العالم وجاهز لنشر الرعب!');

    // 1. هالة البارتيكلز (تأثير لهب وشرار حول هيروبرين)
    setInterval(() => {
      bot.chat('/execute at Herobrine run particle minecraft:flame ~ ~1 ~ 0.2 0.5 0.2 0.01 10');
      bot.chat('/execute at Herobrine run particle minecraft:lava ~ ~1.2 ~ 0.2 0.2 0.2 0.01 5');
    }, 1200);

    // 2. إلحاق الضرر باللاعبين القريبين منه (مسافة 3 بلوكات)
    setInterval(() => {
      bot.chat('/damage @a[distance=..3,name=!Herobrine] 4 entity_attack entity Herobrine');
    }, 1000);

    // 3. قدرات الرعب الدورية (كل 30 ثانية)
    setInterval(() => {
      // إعطاء تأثير الظلام والعمى
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
  // 6. كشف الأخطاء وتفسيرها
  client.on('error', (err) => {
    const errMsg = err.message || String(err);
    console.log('❌ [خطأ في الاتصال]:', errMsg);

    if (errMsg.includes('Connect timed out') || errMsg.includes('ETIMEDOUT')) {
      console.log('🔴 [تشخيص Aternos]: السيرفر مغلق (Offline) حالياً أو أن رقم المنفذ (Port) تغير.');
    }
  });

  // 7. عند انقطاع الاتصال
  client.on('close', (reason) => {
    console.log('⚠️ [انقطع الاتصال]: السبب -', reason || 'غير معروف');
    scheduleReconnect();
  });
}

// دالة التكرار التلقائي للمحاولة عند انقطاع الاتصال
function scheduleReconnect() {
  isAttempting = false;
  console.log('🔄 سيتم إعادة فحص السيرفر ومحاولة الدخول خلال 15 ثانية...\n');
  setTimeout(startBot, 15000);
}

// بدء تشغيل البوت
startBot();
