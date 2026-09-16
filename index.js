const http = require('http');
const bedrock = require('bedrock-protocol');

// خادم وهمي لإبقاء الخدمة تعمل على Render
http.createServer((req, res) => res.end('Bedrock Bot Active!')).listen(process.env.PORT || 3000);

// إعدادات اتصال البوت بالسيرفر
const botConfig = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058,
  username: 'Herobrine',
  offline: false,       // يتوافق مع حماية شبكة Bedrock عبر حساب Microsoft
  version: '1.26.45',   // إصدار بروتوكول البيدروك المتوافق
  skipPing: true,       // منع قطع الاتصال أثناء فحص الاستجابة
  onMsaCode: (data) => {
    console.log('====================================================');
    console.log('🔐 لتسجيل دخول البوت، افتح الرابط التالي:');
    console.log(data.verification_uri);
    console.log('🔑 وأدخل هذا الرمز:', data.user_code);
    console.log('====================================================');
  }
};

// دالة التشغيل وإعادة الاتصال التلقائي
function startBot() {
  console.log('🔄 جاري الاتصال بالسيرفر...');
  const client = bedrock.createClient(botConfig);

  // أحداث الاتصال والتفاعل
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
