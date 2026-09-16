const http = require('http');
const bedrock = require('bedrock-protocol');

// 1. خادم ويب لإبقاء الخدمة حية ومستمرة على منصة Render
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('🤖 بوت هيروبرين يعمل ويراقب السيرفر!');
}).listen(process.env.PORT || 3000);

// 2. إعدادات اتصال البوت بالسيرفر
const botConfig = {
  host: 'SERAJ_ABDO2.aternos.me',
  port: 52058, // تأكد من مطابقة المنفذ (Port) الظاهر في صفحة Aternos الرئيسية
  username: 'Herobrine',
  offline: false,
  version: '1.26.45', // الإصدار المعتمد للاتصال
  profilesFolder: './msa_folder' // مجلد جديد ونظيف لحفظ توثيق حساب Microsoft
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

  // دالة إرسال أوامر الأدمن إلى شات ماينكرافت
  function sendCmd(cmd) {
    if (!client) return;
    try {
      client.queue('text', {
        type: 'chat',
        needs_translation: false,
        source_name: 'Herobrine',
        message: cmd,
        xuid: '',
        platform_chat_id: ''
      });
    } catch (e) {
      // تجاهل الأخطاء عند عدم اكتمال تحميل الشات
    }
  }

  // 1. طلب رمز توثيق مايكروسوفت عند الحاجة أول مرة
  client.on('msaCode', (data) => {
    console.log('\n====================================================');
    console.log('🔐 [توثيق Microsoft مطلوب]');
    console.log('👉 افتح الرابط: ' + data.verification_uri);
    console.log('🔑 أدخل الرمز: ' + data.user_code);
    console.log('====================================================\n');
  });

  // 2. نجاح التوثيق مع حساب مايكروسوفت
  client.on('session', () => {
    console.log('🔑 ✅ [نجاح التوثيق] تم التوثيق مع Microsoft! جاري التحقق من جاهزية السيرفر...');
  });

  // 3. الاتصال بمنفذ الشبكة
  client.on('connect', () => {
    console.log('🌐 [اتصال الشبكة] تم الوصول لمنفذ السيرفر، جاري دخول العالم...');
  });

  // 4. الدخول الكامل إلى السيرفر وتفعيل كود الرعب
  client.on('join', () => {
    isAttempting = false;
    console.log('🎉 ✅ [تم الدخول بنجاح] هيروبرين متصل الآن داخل السيرفر!');

    // أ) هالة البارتيكلز (تأثير لهب وشرار لافا متصاعد حول البوت)
    setInterval(() => {
      sendCmd('/execute at Herobrine run particle minecraft:basic_flame_particle ~ ~1 ~');
      sendCmd('/execute at Herobrine run particle minecraft:lava_particle ~ ~1.2 ~');
    }, 1200);

    // ب) إلحاق الضرر باللاعبين القريبين منه (مسافة 3 بلوكات)
    setInterval(() => {
      sendCmd('/damage @a[r=3,name=!Herobrine] 4 entity_attack entity Herobrine');
    }, 1000);

    // ج) قدرات الرعب الدورية (كل 30 ثانية)
    setInterval(() => {
      // إعطاء تأثير العمى والظلام للاعبين القريبين
      sendCmd('/effect give @a[r=15,name=!Herobrine] darkness 6 1 true');
      sendCmd('/effect give @a[r=15,name=!Herobrine] blindness 4 1 true');

      // تشغيل صوت صراخ مرعب عند موقع اللاعبين
      sendCmd('/execute at @a run playsound mob.ghast.scream @s ~ ~ ~ 1 0.7');

      // الانتقال الفجائي (Teleport) خلف لاعب عشوائي
      sendCmd('/execute at @r[name=!Herobrine] run tp Herobrine ~ ~ ~-2');
    }, 30000);
  });

  // 5. التفاعل مع شات اللعبة عند ذكر اسمه
  client.on('text', (packet) => {
    if (packet.message && packet.message.toLowerCase().includes('herobrine')) {
      sendCmd('I am always watching you...');
    }
  });

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
