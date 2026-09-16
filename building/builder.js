const {GoalNear}=require('mineflayer-pathfinder').goals
const {state,action}=require('../ai/memory')

let bot=null
let built=false

function init(b){
  bot=b
}

async function tryBuild(){
  if(!bot?.entity||built||state.rage||state.busy)return false

  const blocks=bot.inventory.items().filter(i=>/planks|cobblestone/.test(i.name))
  if(blocks.length<12)return false

  const home=state.home
  if(!home)return false

  state.busy=true
  action('build')

  try{
    const p=bot.entity.position
    if(p.distanceTo(new bot.entity.position.constructor(home.x,home.y,home.z))>30){
      return false
    }

    const blockItem=blocks[0]
    await bot.equip(blockItem,'hand')

    const positions=[]
    const x=home.x
    const y=home.y
    const z=home.z

    for(let dx=0;dx<5;dx++){
      for(let dz=0;dz<5;dz++){
        if(dx===0||dx===4||dz===0||dz===4){
          positions.push({x:x+dx,y:y,z:z+dz})
          positions.push({x:x+dx,y:y+1,z:z+dz})
        }
      }
    }

    for(const pos of positions.slice(0,18)){
      const block=bot.blockAt(new bot.entity.position.constructor(pos.x,pos.y,pos.z))
      const below=bot.blockAt(new bot.entity.position.constructor(pos.x,pos.y-1,pos.z))

      if(block?.name==='air'&&below){
        await bot.pathfinder.goto(new GoalNear(pos.x,pos.y,pos.z,2))
        await bot.placeBlock(below,new bot.entity.position.constructor(pos.x-below.position.x,pos.y-below.position.y,pos.z-below.position.z))
      }
    }

    built=true
    console.log('🏠 Basic home structure built')
    return true
  }catch(err){
    console.error('❌ Building error:',err.message)
    return false
  }finally{
    state.busy=false
  }
}

module.exports={init,tryBuild}
