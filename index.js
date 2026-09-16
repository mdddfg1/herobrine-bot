const http = require('http');
const mineflayer = require('mineflayer');

// ======================================================
// ⚙️ إعدادات البوت
// ======================================================

const CONFIG = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058,

  username: 'Herobrine',

  // إذا كان سيرفر Aternos مضبوطًا على Cracked / Offline:
  auth: 'offline',

  // نبقي 26.3 كما هو حاليًا
  version: '26.1',

  // إعادة الاتصال الأساسية
  reconnect: true,

  // أقل مدة قبل محاولة الاتصال التالية
  minReconnectDelay: 15000,

  // أقصى مدة انتظار
  maxReconnectDelay: 300000
};

// ======================================================
// 🌐 Web Server - Render
// ======================================================

const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  });

  res.end(
    '👻 Herobrine Bot يعمل\n' +
    'Minecraft Java 26.1\n'
  );
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// ======================================================
// 🤖 حالة البوت
// ======================================================

let bot = null;
let reconnectTimer = null;

let reconnectDelay = CONFIG.minReconnectDelay;

let powersInterval = null;
let damageInterval = null;

// لمنع تشغيل أكثر من اتصال في نفس الوقت
let connecting = false;

// ======================================================
// 🧹 تنظيف المؤقتات
// ======================================================

function clearBotTimers() {
  if (powersInterval) {
    clearInterval(powersInterval);
    powersInterval = null;
  }

  if (damageInterval) {
    clearInterval(damageInterval);
    damageInterval = null;
  }
}

// ======================================================
// ⏳ إعادة الاتصال
// ======================================================

function scheduleReconnect(reason = '') {
  if (!CONFIG.reconnect) {
    return;
  }

  if (reconnectTimer) {
    return;
  }

  const delay = reconnectDelay;

  console.log('');
  console.log('🔄 إعادة الاتصال مجدولة');
  console.log(`⏳ الانتظار: ${Math.round(delay / 1000)} ثانية`);

  if (reason) {
    console.log(`📌 السبب: ${reason}`);
  }

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;

    startBot();

  }, delay);

  // زيادة مدة الانتظار للمحاولة التالية
  reconnectDelay = Math.min(
    reconnectDelay * 2,
    CONFIG.maxReconnectDelay
  );
}

// ======================================================
// 🤖 إنشاء البوت
// ======================================================

function startBot() {

  if (connecting) {
    console.log('⚠️ توجد محاولة اتصال بالفعل...');
    return;
  }

  if (bot) {
    console.log('⚠️ يوجد بوت حالي، لن يتم إنشاء اتصال آخر.');
    return;
  }

  connecting = true;

  console.log('');
  console.log('======================================');
  console.log('👻 Starting Herobrine');
  console.log(`🎮 Minecraft: ${CONFIG.version}`);
  console.log('📡 Protocol: 777');
  console.log(`🌍 Server: ${CONFIG.host}:${CONFIG.port}`);
  console.log(`👤 Username: ${CONFIG.username}`);
  console.log('======================================');

  try {

    bot = mineflayer.createBot({
      host: CONFIG.host,
      port: CONFIG.port,
      username: CONFIG.username,
      auth: CONFIG.auth,
      version: CONFIG.version,

      // منع بعض مشاكل الاتصال
      checkTimeoutInterval: 60000
    });

  } catch (error) {

    connecting = false;
    bot = null;

    console.error('❌ Bot creation failed:', error);

    scheduleReconnect(error.message);

    return;
  }

  // ====================================================
  // 🟢 اتصال ناجح
  // ====================================================

  bot.once('spawn', () => {

    connecting = false;

    // الاتصال نجح، نرجع زمن إعادة الاتصال إلى البداية
    reconnectDelay = CONFIG.minReconnectDelay;

    console.log('');
    console.log('======================================');
    console.log('✅ HEROBRINE JOINED THE SERVER');
    console.log('👻 البوت دخل السيرفر بنجاح!');
    console.log('======================================');

    startHerobrinePowers();
  });

  // ====================================================
  // 💬 الشات
  // ====================================================

  bot.on('chat', (username, message) => {

    if (!message) {
      return;
    }

    const text = message.toLowerCase();

    console.log(`💬 ${username}: ${message}`);

    if (
      text.includes('herobrine') ||
      text.includes('هيروبرين')
    ) {

      const responses = [
        '👻 I am watching...',
        '👁️ You should not have called me.',
        '😈 Herobrine is here.',
        '☠️ I see you...',
        '👻 Do you really think you are alone?'
      ];

      const response =
        responses[Math.floor(Math.random() * responses.length)];

      setTimeout(() => {

        if (bot && bot.chat) {
          bot.chat(response);
        }

      }, 1000 + Math.random() * 2000);
    }
  });

  // ====================================================
  // ❌ الطرد
  // ====================================================

  bot.on('kicked', (reason) => {

    let message = reason;

    try {
      if (typeof reason === 'string') {
        const parsed = JSON.parse(reason);
        message = parsed;
      }
    } catch (_) {}

    console.log('');
    console.log('🚫 Kicked:', message);

    clearBotTimers();

    connecting = false;

    // مهم جدًا:
    // إذا كان السيرفر يطلب الانتظار، نعطيه مدة أطول
    if (
      typeof reason === 'string' &&
      (
        reason.toLowerCase().includes('throttled') ||
        reason.toLowerCase().includes('wait before reconnecting')
      )
    ) {

      reconnectDelay = Math.max(
        reconnectDelay,
        60000
      );

      console.log('⏳ السيرفر طلب الانتظار قبل إعادة الاتصال.');
      console.log(
        `⏱️ سننتظر ${Math.round(reconnectDelay / 1000)} ثانية على الأقل.`
      );
    }
  });

  // ====================================================
  // 🔌 إغلاق الاتصال
  // ====================================================

  bot.on('end', (reason) => {

    console.log('');
    console.log('🔌 Connection closed:', reason || 'unknown');

    clearBotTimers();

    connecting = false;

    bot = null;

    scheduleReconnect(
      reason || 'Connection closed'
    );
  });

  // ====================================================
  // ❌ أخطاء البوت
  // ====================================================

  bot.on('error', (error) => {

    console.error('');
    console.error('❌ Bot error:', error.message);

    // لا ننشئ اتصالًا جديدًا هنا مباشرة.
    // حدث end سيعالج إعادة الاتصال.
  });

  // ====================================================
  // 💥 مشكلة الاتصال
  // ====================================================

  bot.on('death', () => {

    console.log('💀 Herobrine died.');

    setTimeout(() => {

      if (bot && bot.chat) {
        bot.chat('👻 You cannot escape me...');
      }

    }, 1500);
  });
}

// ======================================================
// 👻 قدرات Herobrine
// ======================================================

function startHerobrinePowers() {

  clearBotTimers();

  if (!bot) {
    return;
  }

  // ====================================================
  // ⚔️ مهاجمة اللاعبين القريبين
  // ====================================================

  damageInterval = setInterval(() => {

    if (!bot || !bot.entity) {
      return;
    }

    try {

      const players = Object.values(bot.players);

      for (const player of players) {

        if (!player || !player.entity) {
          continue;
        }

        // لا يهاجم نفسه
        if (player.username === bot.username) {
          continue;
        }

        const distance =
          bot.entity.position.distanceTo(
            player.entity.position
          );

        if (distance <= 3) {

          console.log(
            `⚔️ Herobrine attacks ${player.username}`
          );

          // أمر ضرر عبر السيرفر
          bot.chat(
            `/damage ${player.username} 4 minecraft:magic`
          );
        }
      }

    } catch (error) {
      console.log(
        '⚠️ Damage error:',
        error.message
      );
    }

  }, 3000);

  // ====================================================
  // 👻 قوى Herobrine كل 30 ثانية
  // ====================================================

  powersInterval = setInterval(() => {

    if (!bot || !bot.entity) {
      return;
    }

    try {

      const players = Object.values(bot.players)
        .filter(player =>
          player &&
          player.entity &&
          player.username !== bot.username
        );

      if (players.length === 0) {
        console.log('👻 لا يوجد لاعب آخر حاليًا.');
        return;
      }

      const target =
        players[
          Math.floor(
            Math.random() * players.length
          )
        ];

      const username = target.username;

      console.log('');
      console.log('👻 ==================================');
      console.log(`👁️ Target: ${username}`);
      console.log('👻 Herobrine power activated');
      console.log('👻 ==================================');

      // ==================================================
      // 🌑 Darkness
      // ==================================================

      bot.chat(
        `/effect give ${username} minecraft:darkness 5 0 true`
      );

      // ==================================================
      // 🔊 Ghast scream
      // ==================================================

      bot.chat(
        `/playsound minecraft:entity.ghast.scream master ${username} ~ ~ ~ 1 0.7`
      );

      // ==================================================
      // ✨ Particles
      // ==================================================

      bot.chat(
        `/particle minecraft:smoke ~ ~1 ~ 0.5 1 0.5 0.02 30`
      );

      // ==================================================
      // 👻 Teleport بالقرب من اللاعب
      // ==================================================

      if (target.entity) {

        const pos = target.entity.position;

        const offsetX =
          Math.floor(Math.random() * 7) - 3;

        const offsetZ =
          Math.floor(Math.random() * 7) - 3;

        const x =
          Math.floor(pos.x + offsetX);

        const y =
          Math.floor(pos.y);

        const z =
          Math.floor(pos.z + offsetZ);

        bot.chat(
          `/tp ${bot.username} ${x} ${y} ${z}`
        );
      }

    } catch (error) {

      console.log(
        '⚠️ Herobrine powers error:',
        error.message
      );
    }

  }, 30000);
}

// ======================================================
// 🚀 تشغيل البوت
// ======================================================

startBot();

// ======================================================
// 🛑 إغلاق آمن
// ======================================================

function shutdown(signal) {

  console.log('');
  console.log(`🛑 Received ${signal}`);

  clearBotTimers();

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (bot) {

    try {
      bot.quit('Server shutting down');
    } catch (_) {}

    bot = null;
  }

  server.close(() => {
    process.exit(0);
  });

  // حماية إذا لم يغلق السيرفر
  setTimeout(() => {
    process.exit(0);
  }, 5000);
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});
