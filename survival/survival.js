const {GoalNear}=require('mineflayer-pathfinder').goals
const {state,action}=require('../ai/memory')

let bot=null
let eating=false

function init(b){
  bot=b
  bot.on('health',()=>{
    if(bot.health<=6)console.log(`❤️ Herobrine health: ${bot.health.toFixed(1)}`)
  })
}

function hasFood(){
  return bot.inventory.items().some(i=>isFood(i.name))
}

function isFood(name){
  return /bread|beef|porkchop|chicken|mutton|rabbit|carrot|potato|baked_potato|apple|melon|sweet_berries|cooked/.test(name)
}

async function handle(){
  if(!bot?.entity||state.rage)return false

  if(bot.food<=8){
    return await eat()
  }

  if(bot.health<=6){
    const ate=await eat()
    if(ate)return true
  }

  return false
}

async function eat(){
  if(eating)return false
  const food=bot.inventory.items().find(i=>isFood(i.name))
  if(!food)return false

  eating=true
  state.busy=true
  action('eat')

  try{
    await bot.equip(food,'hand')
    if(bot.food<20||bot.health<18)await bot.consume()
    console.log(`🍖 Ate ${food.name}`)
    return true
  }catch(err){
    console.error('❌ Eating error:',err.message)
    return false
  }finally{
    eating=false
    state.busy=false
  }
}

async function findFood(){
  if(!bot?.entity)return false
  const item=bot.nearestEntity(e=>{
    return e&&e.name==='item'&&e.position
  })

  if(item){
    try{
      await bot.pathfinder.goto(new GoalNear(item.position.x,item.position.y,item.position.z,1))
      return true
    }catch(err){
      console.error('⚠️ Food pickup path error:',err.message)
    }
  }

  return await eat()
}

async function sleep(){
  if(!bot?.entity||state.rage)return false

  const bed=bot.findBlock({
    matching:block=>block&&/bed$/.test(block.name),
    maxDistance:32
  })

  if(!bed)return false

  state.busy=true
  action('sleep')

  try{
    await bot.pathfinder.goto(new GoalNear(bed.position.x,bed.position.y,bed.position.z,2))
    await bot.sleep(bed)
    console.log('🛏️ Herobrine sleeping')
    await new Promise(r=>setTimeout(r,3000))
    if(bot.isSleeping)await bot.wake()
    console.log('🌅 Herobrine woke up')
    return true
  }catch(err){
    console.error('⚠️ Sleep error:',err.message)
    return false
  }finally{
    state.busy=false
  }
}

module.exports={init,handle,hasFood,findFood,sleep}
