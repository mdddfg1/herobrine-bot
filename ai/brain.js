
const {state,setHome,rememberPlayer,action}=require('./memory')
const combat=require('../combat/combat')
const survival=require('../survival/survival')
const wood=require('../gathering/wood')
const mining=require('../gathering/mining')
const builder=require('../building/builder')

let bot=null
let loopTimer=null
let idleTimer=null

function init(b){
  bot=b
  setHome(bot.entity.position)
  state.started=true
  console.log(`🏠 Home remembered at ${formatPos(bot.entity.position)}`)
  clearTimeout(loopTimer)
  clearInterval(idleTimer)
  loopTimer=setTimeout(decisionLoop,3000)
  idleTimer=setInterval(humanIdle,12000)
}

async function decisionLoop(){
  if(!bot||!bot.entity){
    loopTimer=setTimeout(decisionLoop,3000)
    return
  }

  try{
    if(state.rage){
      loopTimer=setTimeout(decisionLoop,1000)
      return
    }

    if(await survival.handle()){
      loopTimer=setTimeout(decisionLoop,2500)
      return
    }

    if(state.busy){
      loopTimer=setTimeout(decisionLoop,3000)
      return
    }

    const hour=bot.time?.timeOfDay??0
    const night=hour>=12500&&hour<=23500
    const hasFood=survival.hasFood()
    const logs=bot.inventory.items().filter(i=>/log|stem/.test(i.name)).length
    const useful=bot.inventory.items().filter(i=>/pickaxe|axe|sword|shovel/.test(i.name)).length

    if(night){
      action('night')
      if(await survival.sleep()){
        loopTimer=setTimeout(decisionLoop,5000)
        return
      }
    }

    if(!hasFood){
      action('food')
      if(await survival.findFood()){
        loopTimer=setTimeout(decisionLoop,4000)
        return
      }
    }

    if(logs<4){
      action('wood')
      if(await wood.gather()){
        loopTimer=setTimeout(decisionLoop,3000)
        return
      }
    }

    if(useful<2){
      action('tools')
      if(await mining.craftTools()){
        loopTimer=setTimeout(decisionLoop,3000)
        return
      }
    }

    if(await mining.mine()){
      loopTimer=setTimeout(decisionLoop,4000)
      return
    }

    if(await builder.tryBuild()){
      loopTimer=setTimeout(decisionLoop,5000)
      return
    }

    action('explore')
    await explore()
  }catch(err){
    console.error('❌ Brain loop error:',err.message)
  }

  loopTimer=setTimeout(decisionLoop,4000)
}

async function explore(){
  if(!bot?.entity)return false
  const p=bot.entity.position
  const dx=Math.floor(Math.random()*21)-10
  const dz=Math.floor(Math.random()*21)-10
  const target={x:p.x+dx,y:p.y,z:p.z+dz}
  try{
    const {GoalNear}=require('mineflayer-pathfinder').goals
    await bot.pathfinder.goto(new GoalNear(target.x,target.y,target.z,3))
    console.log(`🧭 Exploring near ${Math.floor(target.x)},${Math.floor(target.y)},${Math.floor(target.z)}`)
    return true
  }catch(err){
    console.error('⚠️ Exploration error:',err.message)
    return false
  }
}

function humanIdle(){
  if(!bot?.entity||state.rage||state.busy)return
  try{
    if(Math.random()<0.5){
      const yaw=bot.entity.yaw+(Math.random()-0.5)
      const pitch=(Math.random()-0.5)*0.4
      bot.look(yaw,pitch,true).catch(()=>{})
    }
  }catch(err){
    console.error('⚠️ Idle look error:',err.message)
  }
}

function chat(username,message){
  rememberPlayer(username)
  const text=String(message||'').toLowerCase()

  if(text.includes('herobrine')||text.includes('هيروبرين')){
    bot.chat('👁️ I am watching...')
    return
  }

  if(text==='come herobrine'||text==='تعال هيروبرين'){
    const target=bot.players[username]?.entity
    if(!target)return
    const {GoalNear}=require('mineflayer-pathfinder').goals
    bot.pathfinder.setGoal(new GoalNear(target.position.x,target.position.y,target.position.z,2))
    action('follow_player')
    return
  }

  if(text==='home'||text==='بيتي'){
    goHome()
  }
}

function goHome(){
  if(!state.home||!bot?.entity)return
  const {GoalNear}=require('mineflayer-pathfinder').goals
  bot.pathfinder.setGoal(new GoalNear(state.home.x,state.home.y,state.home.z,2))
  action('home')
}

function onDeath(){
  state.busy=false
  state.rage=false
  setTimeout(()=>{
    if(bot?.entity&&!state.home)setHome(bot.entity.position)
  },5000)
}

function formatPos(p){
  return `${Math.floor(p.x)},${Math.floor(p.y)},${Math.floor(p.z)}`
}

module.exports={init,chat,onDeath,goHome}
