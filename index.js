const http = require('http');
const bedrock = require('bedrock-protocol');

http.createServer((req, res) => res.end('Bedrock Bot Active!')).listen(process.env.PORT || 3000);

const botConfig = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058,
  username: 'Herobrine',
  offline: true,
  version: '1.26.45', // تثبيت إصدار البروتوكول المتوافق مع السيرفر
  skipPing: true      // تجاوز فحص الـ Ping لمنع قطع الاتصال الفوري
};

function startBot() {
  console.log('🔄 جاري الاتصال بالسيرفر...');
  const client = bedrock.createClient(botConfig);

  client.on('join', () => {
    console.log('✅ دخل هيروبرين إلى سيرفر البيدروك بنجاح!');
  });

  client.on('text', (packet) => {
    if (packet.message && packet.message.toLowerCase().includes('hello')) {
      client.queue('text', {
        type: 'chat',
        needs_translation: false,
        source_name: 'Herobrine',
        message: 'I am always watching you...',
        xuid: '',
        platform_chat_id: ''
      });
    }
  });

  client.on('error', (err) => {
    console.log('❌ خطأ في الاتصال:', err.message || err);
  });

  client.on('close', (reason) => {
    console.log('⚠️ انقطع الاتصال بالسيرفر! السبب:', reason || 'Disconnect');
    console.log('🔄 إعادة محاولة الدخول خلال 10 ثوانٍ...');
    setTimeout(startBot, 10000);
  });
}

startBot();
