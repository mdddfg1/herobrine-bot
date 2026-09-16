const http = require('http');
const bedrock = require('bedrock-protocol');

// 1. خادم إبقاء الخدمة حية ومستمرة على منصة Render
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('🤖 بوت هيروبرين يعمل ويراقب السيرفر!');
}).listen(process.env.PORT || 3000);

// 2. إعدادات اتصال البوت
const botConfig = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058,
  username: 'Herobrine',
  offline: false,
  
  profilesFolder: './msa-cache' // حفظ التوثيق محلياً لمنع تكرار طلب الرمز
};

let isAttempting = false;

function startBot() {
  if (isAttempting) return;
  isAttempting = true;

  console.log('----------------------------------------------------');
  console.log('🔄 [فحص الاتصال] جاري محاولة التوصيل بسيرفر Aternos...');

  let client;
  try {
    client = bedrock.createClient(botConfig);
  } catch (err) {
    console.log('❌ [خطأ في النظام]:', err.message);
    scheduleReconnect();
    return;
  }

  // حالة 1: طلب توثيق مايكروسوفت (عند الحاجة)
  client.on('msaCode', (data) => {
    console.log('\n====================================================');
    console.log('🔐 [توثيق Microsoft مطلوب]');
    console.log('👉 افتح الرابط: ' + data.verification_uri);
    console.log('🔑 أدخل الرمز: ' + data.user_code);
    console.log('⚠️ يرجى التفعيل خلال دقائق لمنع انتهاء مهلة الرمز.');
    console.log('====================================================\n');
  });

  // حالة 2: نجاح التوثيق مع حساب مايكروسوفت
  client.on('session', () => {
    console.log('🔑 ✅ [نجاح التوثيق] تم التوثيق مع Microsoft! جاري فحص جاهزية السيرفر...');
  });

  // حالة 3: الوصول لمنفذ السيرفر عبر الشبكة
  client.on('connect', () => {
    console.log('🌐 [اتصال الشبكة] تم الوصول لمنفذ السيرفر (UDP)، جاري دخول العالم...');
  });

  // حالة 4: دخول عالم ماينكرافت بنجاح
  client.on('join', () => {
    isAttempting = false;
    console.log('🎉 ✅ [تم الدخول بنجاح] هيروبرين متصل الآن داخل عالم السيرفر!');
  });

  // حالة 5: التفاعل مع الدردشة
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

  // حالة 6: التقاط وتفسير الأخطاء التفصيلية
  client.on('error', (err) => {
    const errMsg = err.message || String(err);
    console.log('❌ [خطأ في الاتصال]:', errMsg);

    if (errMsg.includes('ECONNREFUSED') || errMsg.includes('ETIMEDOUT') || errMsg.includes('ENOTFOUND')) {
      console.log('🔴 [حالة السيرفر]: سيرفر Aternos مطفأ (Offline) حالياً أو منفذ الاتصال مغلق.');
    } else if (errMsg.includes('Disconnect') || errMsg.includes('disconnect')) {
      console.log('⚠️ [حالة السيرفر]: تم رفض الاتصال. قد يكون السيرفر في مرحلة إعادة التشغيل.');
    }
  });

  // حالة 7: عند انقطاع الاتصال أو إغلاقه
  client.on('close', (reason) => {
    const cause = reason || 'غير معروف';
    console.log('⚠️ [انقطاع الاتصال]: السبب -', cause);

    if (cause.includes('Server requested disconnect') || cause.includes('Disconnect')) {
      console.log('📢 [تشخيص Aternos]: السيرفر غير متاح (Offline). شَغِّل السيرفر من موقع Aternos وسيدخل البوت تلقائياً.');
    }

    scheduleReconnect();
  });
}

// دالة إعادة الاتصال التلقائي المستمر
function scheduleReconnect() {
  isAttempting = false;
  console.log('🔄 سيعيد البوت فحص السيرفر ومحاولة الدخول خلال 15 ثانية...\n');
  setTimeout(startBot, 15000);
}

// بدء التشغيل
startBot();
