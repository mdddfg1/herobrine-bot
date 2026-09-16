const http = require('http');
const bedrock = require('bedrock-protocol');

// خادم وهمي لإبقاء الخدمة تعمل على Render
http.createServer((req, res) => res.end('Bedrock Bot Active!')).listen(process.env.PORT || 3000);

const botConfig = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058,
  username: 'Herobrine',
  offline: false,
  version: '1.26.45',
  skipPing: true,
  profilesFolder: './msa-cache' // حفظ ملفات التوثيق محلياً لمنع طلب الرمز مجدداً
};

function startBot() {
  console.log('🔄 جاري بدء الاتصال والتحقق من حساب Microsoft...');
  
  let checkInterval = null;

  const client = bedrock.createClient({
    ...botConfig,
    onMsaCode: (data) => {
      console.log('====================================================');
      console.log('🔐 افتح الرابط لتأكيد الدخول: ' + data.verification_uri);
      console.log('🔑 أدخل الرمز التالي: ' + data.user_code);
      console.log('====================================================');

      // طباعة رسالة كل 15 ثانية لتأكيد أن البوت يفحص ويرتقب دخولك
      if (checkInterval) clearInterval(checkInterval);
      checkInterval = setInterval(() => {
        console.log('⏳ البوت مستمر في الفحص بانتظار إكمال التوثيق عبر الرابط...');
      }, 15000);
    }
  });

  // عند إتمام التوثيق والدخول بنجاح
  client.on('join', () => {
    if (checkInterval) clearInterval(checkInterval);
    console.log('✅ تم التحقق من حساب Microsoft ودخل البوت إلى السيرفر بنجاح!');
  });

  // عند حدوث خطأ أثناء الفحص أو الاتصال
  client.on('error', (err) => {
    if (checkInterval) clearInterval(checkInterval);
    console.log('❌ خطأ في الاتصال أو التوثيق:', err.message || err);
  });

  // عند انقطاع الاتصال أو انتهاء مهلة الرمز
  client.on('close', (reason) => {
    if (checkInterval) clearInterval(checkInterval);
    console.log('⚠️ انقطع الاتصال أو انتهت المهلة! السبب:', reason || 'Disconnected');
    console.log('🔄 إعادة محاولة الفحص والدخول خلال 10 ثوانٍ...');
    setTimeout(startBot, 10000);
  });
}

startBot();
