const {GoalNear}=require('mineflayer-pathfinder').goals
const {state,action}=require('../ai/memory')

let bot=null
let working=false

function init(b){
  bot=b
}

async function craftTools(){
  if(!bot?.entity||working||state.rage)return false

  const mc=bot.mcData
  if(!mc?.recipes)return false

  const planks=findItem(/_planks$/)
  const sticks=findItem(/^stick$/)

  try{
    state.busy=true
    working=true
    action('craft')

    if(planks&&!sticks){
      const stickId=mc.itemsByName.stick?.id
      if(stickId){
        const recipes=bot.recipesFor(stickId,null,1,null)
        if(recipes.length){
          await bot.craft(recipes[0],1,null)
          console.log('🪵 Crafted sticks')
        }
      }
    }

    if(findItem(/^wooden_pickaxe$/)===null||findItem(/^stone_pickaxe$/)===null){
      const pick=mc.itemsByName.stone_pickaxe||mc.itemsByName.wooden_pickaxe
      if(pick){
        const recipes=bot.recipesFor(pick.id,null,1,null)
        if(recipes.length){
          await bot.craft(recipes[0],1,null)
          console.log(`⛏️ Crafted ${pick.name}`)
          return true
        }
      }
    }

    return false
  }catch(err){
    console.error('❌ Crafting error:',err.message)
    return false
  }finally{
    working=false
    state.busy=false
  }
}

async function mine(){
  if(!bot?.entity||working||state.rage)return false

  const targets=[
    'coal_ore',
    'iron_ore',
    'copper_ore',
    'stone',
    'deepslate'
  ]

  const block=bot.findBlock({
    matching:b=>b&&targets.includes(b.name),
    maxDistance:24
  })

  if(!block)return false

  working=true
  state.busy=true
  action('mine')

  try{
    await bot.pathfinder.goto(new GoalNear(block.position.x,block.position.y,block.position.z,2))
    const tool=bot.pathfinder.bestHarvestTool(block)
    if(tool)await bot.equip(tool,'hand')
    await bot.dig(block)
    console.log(`⛏️ Mined ${block.name}`)
    return true
  }catch(err){
    console.error('❌ Mining error:',err.message)
    return false
  }finally{
    working=false
    state.busy=false
  }
}

function findItem(regex){
  const item=bot.inventory.items().find(i=>regex.test(i.name))
  return item||null
}

module.exports={init,craftTools,mine}
