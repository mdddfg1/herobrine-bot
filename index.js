const http = require('http');
const mineflayer = require('mineflayer');

// ======================================================
// إعدادات Render Web Service
// ======================================================

const WEB_PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  });

  res.end(
    '🤖 بوت هيروبرين يعمل!\n' +
    'Minecraft Java 26.3\n'
  );
}).listen(WEB_PORT, '0.0.0.0', () => {
  console.log(`🌐 Web server يعمل على المنفذ ${WEB_PORT}`);
});

// ======================================================
// إعدادات Minecraft
// ======================================================

const BOT_OPTIONS = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058,

  username: 'Herobrine',

  // السيرفر Offline
  auth: 'offline',

  // مهم:
  // لا نضع version هنا حتى يحاول Mineflayer اكتشاف
  // النسخة تلقائياً من السيرفر.
};

// ======================================================
// متغيرات البوت
// ======================================================

let bot = null;
let reconnectTimer = null;
let reconnecting = false;

let particleInterval = null;
let damageInterval = null;
let horrorInterval = null;

// ======================================================
// تنظيف المؤقتات
// ======================================================

function clearIntervals() {
  if (particleInterval) {
    clearInterval(particleInterval);
    particleInterval = null;
  }

  if (damageInterval) {
    clearInterval(damageInterval);
    damageInterval = null;
  }

  if (horrorInterval) {
    clearInterval(horrorInterval);
    horrorInterval = null;
  }
}

// ======================================================
// إعادة الاتصال
// ======================================================

function scheduleReconnect() {
  if (reconnecting) return;

  reconnecting = true;

  clearIntervals();

  console.log('🔄 سيتم إعادة الاتصال خلال 15 ثانية...');

  reconnectTimer = setTimeout(() => {
    reconnecting = false;
    createBot();
  }, 15000);
}

// ======================================================
// إنشاء البوت
// ======================================================

function createBot() {
  console.log('');
  console.log('====================================================');
  console.log('👻 HEROBRINE BOT');
  console.log('====================================================');

  console.log('🔄 محاولة الاتصال بسيرفر Minecraft...');
  console.log(`🌐 Host: ${BOT_OPTIONS.host}`);
  console.log(`🔌 Port: ${BOT_OPTIONS.port}`);
  console.log('🎮 Version: Auto Detect');
  console.log('🔐 Auth: Offline');

  clearIntervals();

  try {
    bot = mineflayer.createBot(BOT_OPTIONS);
  } catch (err) {
    console.log('❌ فشل إنشاء البوت');
    printError(err);
    scheduleReconnect();
    return;
  }

  // ====================================================
  // LOGIN
  // ====================================================

  bot.once('login', () => {
    console.log('');
    console.log('🎉 ================================================');
    console.log('✅ تم تسجيل دخول Herobrine بنجاح!');
    console.log('====================================================');

    if (bot.version) {
      console.log(`🎮 Minecraft Version: ${bot.version}`);
    }

    if (bot.protocolVersion) {
      console.log(`📡 Protocol: ${bot.protocolVersion}`);
    }
  });

  // ====================================================
  // SPAWN
  // ====================================================

  bot.once('spawn', () => {
    console.log('');
    console.log('👻 ================================================');
    console.log('🔥 HEROBRINE دخل العالم!');
    console.log('====================================================');

    if (bot.version) {
      console.log(`🎮 الإصدار: ${bot.version}`);
    }

    startHerobrinePowers();
  });

  // ====================================================
  // CHAT
  // ====================================================

  bot.on('chat', (username, message) => {
    if (!username || username === bot.username) return;

    console.log(`💬 ${username}: ${message}`);

    if (message.toLowerCase().includes('herobrine')) {
      bot.chat('I am always watching you...');
    }
  });

  // ====================================================
  // KICK
  // ====================================================

  bot.on('kicked', (reason) => {
    console.log('🚫 تم طرد البوت من السيرفر:');
    console.log(reason);
  });

  // ====================================================
  // ERROR
  // ====================================================

  bot.on('error', (err) => {
    console.log('');
    console.log('❌ ================================================');
    console.log('ERROR');
    console.log('====================================================');

    printError(err);
  });

  // ====================================================
  // END
  // ====================================================

  bot.on('end', (reason) => {
    console.log('');
    console.log('⚠️ ================================================');
    console.log('🔌 انقطع اتصال Herobrine');
    console.log('====================================================');

    console.log('السبب:', reason || 'غير معروف');

    clearIntervals();

    bot = null;

    scheduleReconnect();
  });
}

// ======================================================
// قدرات هيروبرين
// ======================================================

function startHerobrinePowers() {
  clearIntervals();

  if (!bot) return;

  console.log('🔥 تشغيل قدرات Herobrine...');

  // ----------------------------------------------------
  // هالة النار واللافا
  // ----------------------------------------------------

  particleInterval = setInterval(() => {
    if (!bot) return;

    try {
      bot.chat(
        '/execute at Herobrine run particle minecraft:flame ~ ~1 ~ 0.2 0.5 0.2 0.01 10'
      );

      bot.chat(
        '/execute at Herobrine run particle minecraft:lava ~ ~1.2 ~ 0.2 0.2 0.2 0.01 5'
      );
    } catch (err) {
      console.log('⚠️ خطأ في Particle:', err.message);
    }
  }, 1200);

  // ----------------------------------------------------
  // الضرر للاعبين القريبين
  // ----------------------------------------------------

  damageInterval = setInterval(() => {
    if (!bot) return;

    try {
      bot.chat(
        '/damage @a[distance=..3,name=!Herobrine] 4 entity_attack entity Herobrine'
      );
    } catch (err) {
      console.log('⚠️ خطأ في Damage:', err.message);
    }
  }, 1000);

  // ----------------------------------------------------
  // قدرات الرعب
  // ----------------------------------------------------

  horrorInterval = setInterval(() => {
    if (!bot) return;

    try {
      bot.chat(
        '/effect give @a[distance=..15,name=!Herobrine] minecraft:darkness 6 1 true'
      );

      bot.chat(
        '/effect give @a[distance=..15,name=!Herobrine] minecraft:blindness 4 1 true'
      );

      bot.chat(
        '/execute at @a run playsound minecraft:entity.ghast.scream master @s ~ ~ ~ 1 0.7'
      );

      bot.chat(
        '/execute at @r[name=!Herobrine] run tp Herobrine ~ ~ ~-2'
      );

    } catch (err) {
      console.log('⚠️ خطأ في قدرات الرعب:', err.message);
    }
  }, 30000);
}

// ======================================================
// طباعة الخطأ بالتفصيل
// ======================================================

function printError(err) {
  if (!err) {
    console.log('❌ خطأ غير معروف');
    return;
  }

  console.log('📌 Code:', err.code || 'غير متوفر');
  console.log('🔢 Errno:', err.errno || 'غير متوفر');
  console.log('⚙️ Syscall:', err.syscall || 'غير متوفر');
  console.log('📝 Message:', err.message || err);

  if (err.stack) {
    console.log('📚 Stack:');
    console.log(err.stack);
  }
}

// ======================================================
// أخطاء Node.js
// ======================================================

process.on('uncaughtException', (err) => {
  console.log('');
  console.log('🚨 ================================================');
  console.log('UNCaught Exception');
  console.log('====================================================');

  printError(err);
});

process.on('unhandledRejection', (reason) => {
  console.log('');
  console.log('🚨 ================================================');
  console.log('Unhandled Promise Rejection');
  console.log('====================================================');

  console.log(reason);
});

// ======================================================
// بدء البوت
// ======================================================

createBot();
