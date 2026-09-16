const http=require('http');
const mineflayer=require('mineflayer');

const CONFIG={
  host:'SERAJ_ABDO2.aternos.me',
  port:52058,
  username:'Herobrine',
  auth:'offline',
  version:'26.1',
  reconnect:true,
  minReconnectDelay:15000,
  maxReconnectDelay:300000,
  playerTargetRange:32,
  mobTargetRange:20,
  attackInterval:700,
  playerDamage:6,
  mobDamage:20
};

const PORT=process.env.PORT||10000;

const server=http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});
  res.end('👻 Herobrine Bot يعمل\nMinecraft Java 26.1\n');
});

server.listen(PORT,'0.0.0.0',()=>{
  console.log(`🌐 Web server running on port ${PORT}`);
});

let bot=null;
let reconnectTimer=null;
let reconnectDelay=CONFIG.minReconnectDelay;
let powersInterval=null;
let combatInterval=null;
let connecting=false;
let currentTarget=null;

function clearBotTimers(){
  if(powersInterval){
    clearInterval(powersInterval);
    powersInterval=null;
  }
  if(combatInterval){
    clearInterval(combatInterval);
    combatInterval=null;
  }
}

function scheduleReconnect(reason=''){
  if(!CONFIG.reconnect||reconnectTimer)return;
  const delay=reconnectDelay;
  console.log('');
  console.log('🔄 إعادة الاتصال مجدولة');
  console.log(`⏳ الانتظار: ${Math.round(delay/1000)} ثانية`);
  if(reason)console.log(`📌 السبب: ${reason}`);
  reconnectTimer=setTimeout(()=>{
    reconnectTimer=null;
    startBot();
  },delay);
  reconnectDelay=Math.min(reconnectDelay*2,CONFIG.maxReconnectDelay);
}

function startBot(){
  if(connecting){
    console.log('⚠️ توجد محاولة اتصال بالفعل...');
    return;
  }
  if(bot){
    console.log('⚠️ يوجد بوت حالي، لن يتم إنشاء اتصال آخر.');
    return;
  }

  connecting=true;

  console.log('');
  console.log('======================================');
  console.log('👻 Starting Herobrine');
  console.log(`🎮 Minecraft: ${CONFIG.version}`);
  console.log(`🌍 Server: ${CONFIG.host}:${CONFIG.port}`);
  console.log(`👤 Username: ${CONFIG.username}`);
  console.log('======================================');

  try{
    bot=mineflayer.createBot({
      host:CONFIG.host,
      port:CONFIG.port,
      username:CONFIG.username,
      auth:CONFIG.auth,
      version:CONFIG.version,
      checkTimeoutInterval:60000
    });
  }catch(error){
    connecting=false;
    bot=null;
    console.error('❌ Bot creation failed:',error);
    scheduleReconnect(error.message);
    return;
  }

  bot.once('spawn',()=>{
    connecting=false;
    reconnectDelay=CONFIG.minReconnectDelay;
    console.log('');
    console.log('======================================');
    console.log('✅ HEROBRINE JOINED THE SERVER');
    console.log('👻 البوت دخل السيرفر بنجاح!');
    console.log('======================================');
    startHerobrineCombat();
    startHerobrinePowers();
  });

  bot.on('chat',(username,message)=>{
    if(!message)return;
    const text=message.toLowerCase();
    console.log(`💬 ${username}: ${message}`);

    if(text.includes('herobrine')||text.includes('هيروبرين')){
      const responses=[
        '👻 I am watching...',
        '👁️ You should not have called me.',
        '😈 Herobrine is here.',
        '☠️ I see you...',
        '👻 Do you really think you are alone?'
      ];
      const response=responses[Math.floor(Math.random()*responses.length)];
      setTimeout(()=>{
        if(bot&&bot.chat)bot.chat(response);
      },1000+Math.random()*2000);
    }
  });

  bot.on('kicked',(reason)=>{
    console.log('');
    console.log('🚫 Kicked:',reason);
    clearBotTimers();
    currentTarget=null;
    connecting=false;

    if(typeof reason==='string'&&(reason.toLowerCase().includes('throttled')||reason.toLowerCase().includes('wait before reconnecting'))){
      reconnectDelay=Math.max(reconnectDelay,60000);
      console.log(`⏳ سننتظر ${Math.round(reconnectDelay/1000)} ثانية.`);
    }
  });

  bot.on('end',(reason)=>{
    console.log('');
    console.log('🔌 Connection closed:',reason||'unknown');
    clearBotTimers();
    currentTarget=null;
    connecting=false;
    bot=null;
    scheduleReconnect(reason||'Connection closed');
  });

  bot.on('error',(error)=>{
    console.error('');
    console.error('❌ Bot error:',error.message);
  });

  bot.on('death',()=>{
    console.log('💀 Herobrine died.');
    currentTarget=null;
    setTimeout(()=>{
      if(bot&&bot.chat)bot.chat('👻 You cannot escape me...');
    },1500);
  });
}

function findNearestPlayer(){
  if(!bot||!bot.entity)return null;
  let nearest=null;
  let nearestDistance=CONFIG.playerTargetRange;

  for(const player of Object.values(bot.players)){
    if(!player||!player.entity||player.username===bot.username)continue;
    const distance=bot.entity.position.distanceTo(player.entity.position);
    if(distance<nearestDistance){
      nearest=player.entity;
      nearestDistance=distance;
    }
  }
  return nearest;
}

function findNearestMob(){
  if(!bot||!bot.entity)return null;
  let nearest=null;
  let nearestDistance=CONFIG.mobTargetRange;

  for(const entity of Object.values(bot.entities)){
    if(!entity||entity.type==='player')continue;
    if(entity.type!=='mob'&&entity.type!=='object')continue;
    if(entity.health!==undefined&&entity.health<=0)continue;

    const distance=bot.entity.position.distanceTo(entity.position);

    if(distance<nearestDistance){
      nearest=entity;
      nearestDistance=distance;
    }
  }
  return nearest;
}

function selectTarget(){
  const player=findNearestPlayer();

  if(player)return{entity:player,type:'player'};

  const mob=findNearestMob();

  if(mob)return{entity:mob,type:'mob'};

  return null;
}

async function lookAtTarget(target){
  if(!bot||!target)return;

  try{
    await bot.lookAt(
      target.position.offset(
        0,
        target.height?target.height*0.7:1,
        0
      ),
      true
    );
  }catch(error){
    console.log('⚠️ Look error:',error.message);
  }
}

function hitEffects(target){
  if(!bot||!target)return;

  try{
    if(target.type==='player'){
      bot.chat(`/particle minecraft:crit ${target.position.x} ${target.position.y+1} ${target.position.z} 0.4 0.5 0.4 0.2 15`);
      bot.chat(`/playsound minecraft:entity.player.attack.strong master ${target.username} ~ ~ ~ 1 0.8`);
      bot.chat(`/playsound minecraft:entity.warden.attack master ${target.username} ~ ~ ~ 0.5 0.6`);
    }else{
      bot.chat(`/particle minecraft:crit ${target.position.x} ${target.position.y+1} ${target.position.z} 0.4 0.5 0.4 0.2 15`);
    }
  }catch(error){
    console.log('⚠️ Hit effect error:',error.message);
  }
}

async function attackTarget(targetData){
  if(!bot||!targetData)return;

  const target=targetData.entity;
  if(!target)return;

  try{
    const distance=bot.entity.position.distanceTo(target.position);

    if(distance>4){
      await lookAtTarget(target);
      return;
    }

    await lookAtTarget(target);
    hitEffects(target);

    if(targetData.type==='player'){
      console.log(`⚔️ Herobrine attacks player: ${target.username}`);
      bot.chat(`/damage ${target.username} ${CONFIG.playerDamage} minecraft:magic`);
    }else{
      console.log(`👹 Herobrine attacks mob: ${target.name||target.displayName||'mob'}`);
      bot.chat(`/execute positioned ${target.position.x} ${target.position.y} ${target.position.z} run damage @e[type=!player,distance=..1] ${CONFIG.mobDamage} minecraft:magic`);
    }
  }catch(error){
    console.log('⚠️ Attack error:',error.message);
  }
}

function startHerobrineCombat(){
  if(combatInterval)clearInterval(combatInterval);

  combatInterval=setInterval(async()=>{
    if(!bot||!bot.entity)return;

    try{
      const targetData=selectTarget();

      if(!targetData){
        currentTarget=null;
        return;
      }

      currentTarget=targetData;

      await lookAtTarget(targetData.entity);
      await attackTarget(targetData);

    }catch(error){
      console.log('⚠️ Combat system error:',error.message);
    }
  },CONFIG.attackInterval);
}

function startHerobrinePowers(){
  if(powersInterval)clearInterval(powersInterval);

  powersInterval=setInterval(()=>{
    if(!bot||!bot.entity)return;

    try{
      const players=Object.values(bot.players).filter(player=>
        player&&player.entity&&player.username!==bot.username
      );

      if(players.length===0){
        console.log('👻 لا يوجد لاعب آخر حاليًا.');
        return;
      }

      let target=null;
      let nearestDistance=Infinity;

      for(const player of players){
        const distance=bot.entity.position.distanceTo(player.entity.position);

        if(distance<nearestDistance){
          nearestDistance=distance;
          target=player;
        }
      }

      if(!target)return;

      const username=target.username;

      console.log('');
      console.log('👻 ==================================');
      console.log(`👁️ Target: ${username}`);
      console.log('👻 Herobrine power activated');
      console.log('👻 ==================================');

      bot.chat(`/effect give ${username} minecraft:darkness 5 0 true`);

      bot.chat(`/playsound minecraft:entity.ghast.scream master ${username} ~ ~ ~ 1 0.7`);

      bot.chat('/particle minecraft:smoke ~ ~1 ~ 0.5 1 0.5 0.02 30');

      lookAtTarget(target.entity);

      const pos=target.entity.position;

      const x=Math.floor(pos.x+Math.floor(Math.random()*7)-3);
      const y=Math.floor(pos.y);
      const z=Math.floor(pos.z+Math.floor(Math.random()*7)-3);

      bot.chat(`/tp ${bot.username} ${x} ${y} ${z}`);

    }catch(error){
      console.log('⚠️ Herobrine powers error:',error.message);
    }
  },30000);
}

startBot();

function shutdown(signal){
  console.log('');
  console.log(`🛑 Received ${signal}`);

  clearBotTimers();

  if(reconnectTimer){
    clearTimeout(reconnectTimer);
    reconnectTimer=null;
  }

  if(bot){
    try{
      bot.quit('Server shutting down');
    }catch(_){}
    bot=null;
  }

  server.close(()=>{
    process.exit(0);
  });

  setTimeout(()=>{
    process.exit(0);
  },5000);
}

process.on('SIGTERM',()=>shutdown('SIGTERM'));
process.on('SIGINT',()=>shutdown('SIGINT'));
