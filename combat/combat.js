const {GoalFollow}=require('mineflayer-pathfinder').goals
const {setAttacker,forgetAttacker,state}=require('../ai/memory')

let bot=null
let rageTimer=null
let effectTimer=null
let soundTimer=null
let currentTarget=null
let lastHit=0

function init(b){
  bot=b
  bot.on('entityHurt',(entity,source)=>{
    if(entity!==bot.entity)return
    const now=Date.now()
    if(now-lastHit<500)return
    lastHit=now
    const attacker=resolveAttacker(source)
    if(attacker)enterRage(attacker)
  })

  bot.on('entityDead',entity=>{
    if(currentTarget&&entity.id===currentTarget.id){
      console.log(`☠️ Rage target killed: ${currentTarget.username||currentTarget.name}`)
      stopRage(true)
    }
  })
}

function resolveAttacker(source){
  if(source&&source.type==='player'&&source.username!==bot.username)return source
  if(source?.entity&&source.entity.type==='player'&&source.entity.username!==bot.username)return source.entity

  const nearby=Object.values(bot.entities)
    .filter(e=>e&&e!==bot.entity&&e.type==='player'&&e.position&&bot.entity.position.distanceTo(e.position)<=7)
    .sort((a,b)=>bot.entity.position.distanceTo(a.position)-bot.entity.position.distanceTo(b.position))

  return nearby[0]||null
}

function enterRage(target){
  if(!target||!target.username)return
  if(currentTarget&&currentTarget.username===target.username)return

  stopRage(false)
  currentTarget=target
  setAttacker(target)
  console.log(`⚔️ ATTACKER DETECTED: ${target.username}`)
  console.log(`👹 RAGE MODE: ${target.username}`)

  try{
    bot.chat(`⚔️ ${target.username}...`)
  }catch(err){
    console.error('❌ Rage chat error:',err.message)
  }

  applyEffects()
  playSound()

  effectTimer=setInterval(applyEffects,2500)
  soundTimer=setInterval(playSound,4500)

  rageTimer=setInterval(()=>{
    if(!currentTarget||!currentTarget.isValid||!bot?.entity){
      stopRage(false)
      return
    }

    const distance=bot.entity.position.distanceTo(currentTarget.position)

    bot.lookAt(currentTarget.position.offset(0,1.5,0),true).catch(()=>{})

    if(distance>3){
      try{
        bot.pathfinder.setGoal(new GoalFollow(currentTarget,2),true)
      }catch(err){
        console.error('❌ Rage path error:',err.message)
      }
    }else{
      try{
        bot.pathfinder.setGoal(null)
        bot.attack(currentTarget)
      }catch(err){
        console.error('❌ Rage attack error:',err.message)
      }
    }
  },250)
}

function applyEffects(){
  if(!currentTarget?.username||!bot)return
  try{
    bot.chat(`/effect give ${currentTarget.username} minecraft:darkness 4 0 true`)
    bot.chat(`/effect give ${currentTarget.username} minecraft:slowness 2 0 true`)
    bot.chat(`/effect give ${currentTarget.username} minecraft:blindness 2 0 true`)
  }catch(err){
    console.error('❌ Rage effect error:',err.message)
  }
}

function playSound(){
  if(!currentTarget?.username||!bot)return
  const sounds=[
    'minecraft:entity.warden.heartbeat',
    'minecraft:entity.warden.angry',
    'minecraft:entity.ghast.scream',
    'minecraft:entity.warden.sonic_boom'
  ]
  const sound=sounds[Math.floor(Math.random()*sounds.length)]
  try{
    bot.chat(`/playsound ${sound} hostile ${currentTarget.username} ~ ~ ~ 3 1`)
    console.log(`🔊 Rage sound: ${sound}`)
  }catch(err){
    console.error('❌ Rage sound error:',err.message)
  }
}

function stopRage(killed){
  clearInterval(rageTimer)
  clearInterval(effectTimer)
  clearInterval(soundTimer)
  rageTimer=null
  effectTimer=null
  soundTimer=null

  if(currentTarget){
    console.log(killed?`🧠 ${currentTarget.username} removed from target memory`:`🧠 Rage target lost`)
  }

  currentTarget=null
  forgetAttacker()

  try{
    if(bot?.pathfinder)bot.pathfinder.setGoal(null)
  }catch(err){
    console.error('❌ Rage stop error:',err.message)
  }
}

module.exports={init,enterRage,stopRage}
