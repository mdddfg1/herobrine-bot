const mineflayer = require('mineflayer');
const http = require('http');

// ===============================
// إعدادات البوت
// ===============================

const CONFIG = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058,

  username: 'Herobrine',
  auth: 'offline',

  // مهم: السيرفر حالياً على Java 26.1
  version: '26.1',

  reconnect: true,
  minReconnectDelay: 15000,
  maxReconnectDelay: 300000
};

// ===============================
// سيرفر HTTP لـ Render
// ===============================

const PORT = process.env.PORT || 10000;

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  });

  res.end('Herobrine Bot is alive 👁️');
}).listen(PORT, () => {
  console.log(`🌐 HTTP server running on port ${PORT}`);
});

// ===============================
// متغيرات البوت
// ===============================

let bot = null;
let reconnectDelay = CONFIG.minReconnectDelay;
let reconnectTimer = null;
let connecting = false;

let damageTimer = null;
let powerTimer = null;
let combatTimer = null;

// ===============================
// الكائنات التي لا نريد مهاجمتها
// ===============================

const FRIENDLY_MOBS = new Set([
  'player',
  'item',
  'experience_orb',
  'armor_stand',
  'villager',
  'wandering_trader',
  'iron_golem',
  'snow_golem',
  'cat',
  'wolf',
  'fox',
  'horse',
  'donkey',
  'mule',
  'llama',
  'trader_llama',
  'parrot',
  'bee',
  'cow',
  'pig',
  'sheep',
  'chicken',
  'rabbit',
  'turtle'
]);

// ===============================
// الكائنات التي يمكن مهاجمتها
// ===============================

const HOSTILE_MOBS = new Set([
  'zombie',
  'husk',
  'drowned',
  'skeleton',
  'stray',
  'bogged',
  'wither_skeleton',
  'creeper',
  'spider',
  'cave_spider',
  'silverfish',
  'endermite',
  'slime',
  'magma_cube',
  'witch',
  'pillager',
  'vindicator',
  'evoker',
  'ravager',
  'vex',
  'guardian',
  'elder_guardian',
  'phantom',
  'blaze',
  'ghast',
  'hoglin',
  'zoglin',
  'piglin_brute',
  'warden',
  'breeze'
]);

// ===============================
// إنشاء البوت
// ===============================

function createBot() {

  if (connecting) {
    console.log('⏳ البوت يحاول الاتصال بالفعل...');
    return;
  }

  connecting = true;

  console.log('');
  console.log('=================================');
  console.log('👁️ HEROBRINE BOT');
  console.log('=================================');
  console.log(`🌐 Server: ${CONFIG.host}:${CONFIG.port}`);
  console.log(`🎮 Java: ${CONFIG.version}`);
  console.log(`👤 Username: ${CONFIG.username}`);
  console.log('=================================');
  console.log('');

  bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    auth: CONFIG.auth,
    version: CONFIG.version
  });

  // ===============================
  // Spawn
  // ===============================

  bot.once('spawn', () => {

    connecting = false;
    reconnectDelay = CONFIG.minReconnectDelay;

    console.log('');
    console.log('=================================');
    console.log('✅ HEROBRINE دخل السيرفر!');
    console.log('=================================');
    console.log('');

    startHerobrinePowers();
    startCombatSystem();
    giveResistances();

    // رسالة دخول
    setTimeout(() => {
      try {
        bot.chat('§5Herobrine has entered the world...');
      } catch {}
    }, 2000);
  });

  // ===============================
  // مقاومة النار والماء
  // ===============================

  function giveResistances() {

    if (!bot) return;

    try {

      // مقاومة النار والحمم
      bot.chat(
        '/effect give @s minecraft:fire_resistance 1000000 0 true'
      );

      // لا يغرق
      bot.chat(
        '/effect give @s minecraft:water_breathing 1000000 0 true'
      );

      // حركة أفضل داخل الماء
      bot.chat(
        '/effect give @s minecraft:dolphins_grace 1000000 0 true'
      );

      console.log('🔥 Fire Resistance enabled');
      console.log('🌊 Water Resistance enabled');

    } catch (err) {
      console.log('⚠️ لم يتم تطبيق مقاومات البوت:', err.message);
    }
  }

  // ===============================
  // نظام القتال
  // ===============================

  function startCombatSystem() {

    if (combatTimer) {
      clearInterval(combatTimer);
    }

    combatTimer = setInterval(() => {

      if (!bot || !bot.entity) return;

      try {

        const target = findTarget();

        if (!target) {
          return;
        }

        // إذا كان لاعباً
        if (
          target.type === 'player' &&
          target.username &&
          target.username !== bot.username
        ) {

          console.log(
            `⚔️ Herobrine attacks player: ${target.username}`
          );

          attackTarget(target);

          return;
        }

        // إذا كان Mob معادٍ
        if (
          target.type === 'mob' &&
          target.name &&
          HOSTILE_MOBS.has(target.name)
        ) {

          console.log(
            `👹 Herobrine attacks mob: ${target.name}`
          );

          attackTarget(target);
        }

      } catch (err) {
        console.log('⚠️ Combat error:', err.message);
      }

    }, 700);
  }

  // ===============================
  // البحث عن أقرب هدف
  // ===============================

  function findTarget() {

    if (!bot || !bot.entity) {
      return null;
    }

    const entities = Object.values(bot.entities);

    let bestTarget = null;
    let bestDistance = Infinity;

    for (const entity of entities) {

      if (!entity || !entity.position) {
        continue;
      }

      // لا يهاجم نفسه
      if (entity === bot.entity) {
        continue;
      }

      const distance =
        bot.entity.position.distanceTo(entity.position);

      // مدى الرؤية/الهجوم
      if (distance > 12) {
        continue;
      }

      // =========================
      // اللاعبون
      // =========================

      if (
        entity.type === 'player' &&
        entity.username &&
        entity.username !== bot.username
      ) {

        if (distance < bestDistance) {
          bestTarget = entity;
          bestDistance = distance;
        }

        continue;
      }

      // =========================
      // الكائنات المعادية
      // =========================

      if (
        entity.type === 'mob' &&
        entity.name &&
        HOSTILE_MOBS.has(entity.name)
      ) {

        if (distance < bestDistance) {
          bestTarget = entity;
          bestDistance = distance;
        }
      }
    }

    return bestTarget;
  }

  // ===============================
  // مهاجمة الهدف
  // ===============================

  function attackTarget(target) {

    if (!target || !bot || !bot.entity) {
      return;
    }

    try {

      const distance =
        bot.entity.position.distanceTo(target.position);

      // قريب جداً
      if (distance <= 4.5) {

        // هجوم Mineflayer
        bot.lookAt(target.position.offset(0, 1, 0), true)
          .then(() => {
            bot.attack(target);
          })
          .catch(() => {
            try {
              bot.attack(target);
            } catch {}
          });

      } else {

        // الاقتراب من الهدف
        bot.lookAt(target.position.offset(0, 1, 0), true)
          .catch(() => {});

        // إذا كان لاعباً نطلب من السيرفر الاقتراب
        if (target.type === 'player' && target.username) {

          try {
            bot.chat(
              `/tp ${bot.username} ${target.username}`
            );
          } catch {}
        }
      }

    } catch (err) {
      console.log('⚠️ Attack error:', err.message);
    }
  }

  // ===============================
  // قدرات هيروبرين
  // ===============================

  function startHerobrinePowers() {

    if (damageTimer) {
      clearInterval(damageTimer);
    }

    if (powerTimer) {
      clearInterval(powerTimer);
    }

    // =============================
    // ضرر اللاعبين القريبين
    // =============================

    damageTimer = setInterval(() => {

      if (!bot || !bot.entity) return;

      try {

        for (const player of Object.values(bot.players)) {

          if (!player.entity) continue;

          if (player.username === bot.username) {
            continue;
          }

          const distance =
            bot.entity.position.distanceTo(
              player.entity.position
            );

          if (distance <= 3) {

            console.log(
              `💀 Herobrine damaged ${player.username}`
            );

            bot.chat(
              `/damage ${player.username} 4 minecraft:magic`
            );
          }
        }

      } catch (err) {
        console.log(
          '⚠️ Damage system error:',
          err.message
        );
      }

    }, 3000);

    // =============================
    // القوى الخاصة
    // =============================

    powerTimer = setInterval(() => {

      if (!bot || !bot.entity) return;

      try {

        // الظلام
        bot.chat(
          '/effect give @a[distance=..12] minecraft:darkness 5 0 true'
        );

        // أصوات هيروبرين
        bot.chat(
          '/playsound minecraft:entity.ghast.scream master @a ~ ~ ~ 1 0.5'
        );

        // دخان
        bot.chat(
          '/particle minecraft:smoke ~ ~1 ~ 0.5 1 0.5 0.05 40'
        );

        // اختيار لاعب عشوائي
        const players = Object.values(bot.players)
          .filter(p =>
            p &&
            p.entity &&
            p.username !== bot.username
          );

        if (players.length > 0) {

          const target =
            players[Math.floor(Math.random() * players.length)];

          console.log(
            `👁️ Herobrine is watching ${target.username}`
          );

          // الانتقال بالقرب منه
          bot.chat(
            `/tp ${bot.username} ${target.username}`
          );
        }

      } catch (err) {
        console.log(
          '⚠️ Power system error:',
          err.message
        );
      }

    }, 30000);
  }

  // ===============================
  // الشات
  // ===============================

  bot.on('chat', (username, message) => {

    if (!message) return;

    const text = message.toLowerCase();

    console.log(
      `💬 ${username}: ${message}`
    );

    if (
      text.includes('herobrine') ||
      text.includes('هيروبرين')
    ) {

      const responses = [
        'I am watching you...',
        'You called my name.',
        'I am here.',
        'You are not alone...',
        'Run...',
        'I see you.',
        'The darkness is coming...'
      ];

      const response =
        responses[
          Math.floor(Math.random() * responses.length)
        ];

      setTimeout(() => {

        if (bot) {
          bot.chat(response);
        }

      }, 800);
    }
  });

  // ===============================
  // الموت
  // ===============================

  bot.on('death', () => {

    console.log('💀 Herobrine died...');

    setTimeout(() => {

      if (!bot || !bot.entity) {
        return;
      }

      try {

        bot.chat(
          '/effect give @s minecraft:fire_resistance 1000000 0 true'
        );

        bot.chat(
          '/effect give @s minecraft:water_breathing 1000000 0 true'
        );

        console.log('🔥 Herobrine powers restored.');

      } catch {}
    }, 3000);
  });

  // ===============================
  // Kicked
  // ===============================

  bot.on('kicked', reason => {

    connecting = false;

    console.log('');
    console.log('🚫 Herobrine kicked:');
    console.log(reason);
    console.log('');

    scheduleReconnect();
  });

  // ===============================
  // End
  // ===============================

  bot.on('end', reason => {

    connecting = false;

    console.log('');
    console.log('🔌 Connection ended:');
    console.log(reason);
    console.log('');

    clearTimers();

    scheduleReconnect();
  });

  // ===============================
  // Errors
  // ===============================

  bot.on('error', err => {

    console.log('');
    console.log('❌ Bot error:');
    console.log(err.message);
    console.log('');

    connecting = false;
  });
}

// ===============================
// إعادة الاتصال
// ===============================

function scheduleReconnect() {

  if (!CONFIG.reconnect) {
    return;
  }

  if (reconnectTimer) {
    return;
  }

  console.log(
    `🔄 Reconnecting in ${reconnectDelay / 1000} seconds...`
  );

  reconnectTimer = setTimeout(() => {

    reconnectTimer = null;

    createBot();

    reconnectDelay =
      Math.min(
        reconnectDelay * 2,
        CONFIG.maxReconnectDelay
      );

  }, reconnectDelay);
}

// ===============================
// إيقاف المؤقتات
// ===============================

function clearTimers() {

  if (damageTimer) {
    clearInterval(damageTimer);
    damageTimer = null;
  }

  if (powerTimer) {
    clearInterval(powerTimer);
    powerTimer = null;
  }

  if (combatTimer) {
    clearInterval(combatTimer);
    combatTimer = null;
  }
}

// ===============================
// إغلاق آمن
// ===============================

process.on('SIGINT', () => {

  console.log('🛑 Shutting down...');

  clearTimers();

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  if (bot) {
    try {
      bot.quit('Shutdown');
    } catch {}
  }

  process.exit(0);
});

process.on('SIGTERM', () => {

  console.log('🛑 SIGTERM received.');

  clearTimers();

  if (bot) {
    try {
      bot.quit('Shutdown');
    } catch {}
  }

  process.exit(0);
});

// ===============================
// تشغيل البوت
// ===============================

createBot();
