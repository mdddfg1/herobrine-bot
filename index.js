const http = require('http');
const bedrock = require('bedrock-protocol');

// خادم وهمي لإبقاء الخدمة تعمل على Render
http.createServer((req, res) => res.end('Bedrock Bot Active!')).listen(process.env.PORT || 3000);

// إعدادات اتصال البوت مع سيرفر البيدروك الخاص بك
const client = bedrock.createClient({
  host: 'SERAJ_ABDO2.aternos.me', // عنوان سيرفرك
  port: 52058,                    // منفذ البيدروك
  username: 'Herobrine',          // اسم البوت
  offline: true                   // لتخطي الحسابات المدفوعة (Cracked)
});

// عند نجاح دخول البوت للسيرفر
client.on('join', () => {
  console.log('✅ دخل هيروبرين إلى سيرفر البيدروك بنجاح!');
});

// التفاعل مع الرسائل في دردشة اللعبة
client.on('text', (packet) => {
  if (packet.message.includes('hello')) {
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

// كشف وإظهار الأخطاء
client.on('error', (err) => console.log('❌ خطأ في الاتصال:', err));
client.on('close', () => console.log('⚠️ انقطع الاتصال بالسيرفر.'));
