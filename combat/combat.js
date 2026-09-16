const {GoalFollow}=require('mineflayer-pathfinder').goals
const {memory,setAttacker,forgetAttacker}=require('../ai/memory')

let bot
let rageTimer
let soundTimer

function init(b){
  bot=b
  bot.on('entityHurt',entity=>{
    if(entity!==bot.entity)return
    detectAttacker()
  })
}

function detectAttacker(){
  const players=Object.values(bot.players)
    .map(p=>p.entity)
    .filter(e=>e&&e.type==='player'&&e.position.distanceTo(bot.entity.position)<8)

  if(!players.length)return

  players.sort((a,b)=>a.position.distanceTo(bot.entity.position)-b.position.distanceTo(bot.entity.position))
  const attacker=players[0]

  if(attacker.username===bot.username)return

  setAttacker(attacker.username)
  console.log(`⚔️ ${attacker.username} attacked Herobrine`)
  startRage(attacker)
}

function startRage(target){
  if(!target)return

  clearInterval(rageTimer)
  clearInterval(soundTimer)

  console.log(`👹 RAGE MODE: ${target.username}`)

  rageEffects(target)
  playRageSounds(target)

  rageTimer=setInterval(()=>{
    if(!target.isValid){
      stopRage()
      return
    }

    if(target.position.distanceTo(bot.entity.position)>3){
      bot.pathfinder.setGoal(new GoalFollow(target,2),true)
    }else{
      bot.pathfinder.setGoal(null)
      attack(target)
    }

    bot.lookAt(target.position.offset(0,1.4,0),true)
  },300)

  soundTimer=setInterval(()=>{
    if(target&&target.isValid)playRageSounds(target)
  },5000)
}

function attack(target){
  try{
    bot.attack(target)
  }catch(err){
    console.error('❌ Attack error:',err.message)
  }
}

function rageEffects(target){
  try{
    bot.chat(`/effect give ${target.username} minecraft:darkness 5 0 true`)
    bot.chat(`/effect give ${target.username} minecraft:slowness 3 0 true`)
  }catch(err){
    console.error('❌ Rage effect error:',err.message)
  }
}

function playRageSounds(target){
  const sounds=[
    'minecraft:entity.warden.heartbeat',
    'minecraft:entity.warden.angry',
    'minecraft:entity.ghast.scream',
    'minecraft:entity.warden.sonic_boom'
  ]

  const sound=sounds[Math.floor(Math.random()*sounds.length)]

  try{
    bot.chat(`/playsound ${sound} hostile ${target.username} ~ ~ ~ 3 1`)
    console.log(`🔊 Rage sound: ${sound}`)
  }catch(err){
    console.error('❌ Sound error:',err.message)
  }
}

function stopRage(){
  clearInterval(rageTimer)
  clearInterval(soundTimer)
  rageTimer=null
  soundTimer=null
  console.log('🧠 Target forgotten')
  forgetAttacker()
}

module.exports={init,startRage,stopRage}
