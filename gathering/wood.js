const {GoalNear}=require('mineflayer-pathfinder').goals
const {state,action}=require('../ai/memory')

let bot=null
let working=false

function init(b){
  bot=b
}

async function gather(){
  if(!bot?.entity||working||state.rage)return false

  const log=bot.findBlock({
    matching:block=>block&&/(_log|_stem)$/.test(block.name),
    maxDistance:32
  })

  if(!log)return false

  working=true
  state.busy=true
  action('wood')

  try{
    for(let i=0;i<6;i++){
      const block=bot.findBlock({
        matching:b=>b&&/(_log|_stem)$/.test(b.name),
        maxDistance:32
      })

      if(!block)break

      await bot.pathfinder.goto(new GoalNear(block.position.x,block.position.y,block.position.z,2))

      const tool=bot.pathfinder.bestHarvestTool(block)
      if(tool)await bot.equip(tool,'hand')

      await bot.dig(block)
      console.log(`🌳 Gathered ${block.name}`)
    }
    return true
  }catch(err){
    console.error('❌ Wood gathering error:',err.message)
    return false
  }finally{
    working=false
    state.busy=false
  }
}

module.exports={init,gather}
