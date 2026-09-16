const http = require('http');
const mineflayer = require('mineflayer');

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  });

  res.end('👻 Herobrine Bot - Minecraft Java 26.3');
}).listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

const options = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058,
  username: 'Herobrine',
  auth: 'offline',
};

let bot;
let reconnectTimer;

function startBot() {
  console.log('======================================');
  console.log('👻 Starting Herobrine');
  console.log('🎮 Minecraft: 26.3');
  console.log('📡 Protocol: 777');
  console.log('======================================');

  try {
    bot = mineflayer.createBot(options);
  } catch (err) {
    console.error('❌ Bot creation failed:', err);
    reconnect();
    return;
  }

  bot.once('login', () => {
    console.log('✅ Login successful');
    console.log('Minecraft version:', bot.version);
    console.log('Protocol:', bot.protocolVersion);
  });

  bot.once('spawn', () => {
    console.log('👻 Herobrine spawned!');
    startPowers();
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;

    console.log(`💬 ${username}: ${message}`);

    if (message.toLowerCase().includes('herobrine')) {
      bot.chat('I am always watching you...');
    }
  });

  bot.on('kicked', reason => {
    console.log('🚫 Kicked:', reason);
  });

  bot.on('error', err => {
    console.error('❌ Minecraft error:', err);
  });

  bot.on('end', reason => {
    console.log('🔌 Connection closed:', reason);
    reconnect();
  });
}

function startPowers() {
  console.log('🔥 Starting Herobrine powers');

  setInterval(() => {
    if (!bot) return;

    bot.chat(
      '/execute at Herobrine run particle minecraft:flame ~ ~1 ~ 0.2 0.5 0.2 0.01 10'
    );

    bot.chat(
      '/execute at Herobrine run particle minecraft:lava ~ ~1.2 ~ 0.2 0.2 0.2 0.01 5'
    );
  }, 1200);

  setInterval(() => {
    if (!bot) return;

    bot.chat(
      '/damage @a[distance=..3,name=!Herobrine] 4 entity_attack entity Herobrine'
    );
  }, 1000);

  setInterval(() => {
    if (!bot) return;

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
  }, 30000);
}

function reconnect() {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    startBot();
  }, 15000);
}

process.on('uncaughtException', err => {
  console.error('🚨 Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
  console.error('🚨 Unhandled Rejection:', err);
});

startBot();
