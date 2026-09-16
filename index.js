const http=require('http')
const mineflayer=require('mineflayer')
const {pathfinder,Movements,goals}=require('mineflayer-pathfinder')
const minecraftData=require('minecraft-data')
const brain=require('./ai/brain')
const combat=require('./combat/combat')
const survival=require('./survival/survival')
const wood=require('./gathering/wood')
const mining=require('./gathering/mining')
const builder=require('./building/builder')

const server=http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/plain'})
  res.end('Herobrine AI is running')
})
server.listen(process.env.PORT||10000,()=>console.log('🌐 Web server running'))

let bot=null
let reconnectTimer=null
let reconnectDelay=15000

function startBot(){
  console.log('👻 Starting Herobrine...')
  bot=mineflayer.createBot({
    host:'SERAJ_ABDO2.aternos.me',
    port:52058,
    username:'Herobrine',
    auth:'offline',
    version:'26.1'
  })

  bot.loadPlugin(pathfinder)

  bot.once('spawn',()=>{
    reconnectDelay=15000
    console.log(`✅ HEROBRINE JOINED | ${bot.version}`)
    try{
      bot.mcData=minecraftData(bot.version)
      const movements=new Movements(bot,bot.mcData)
      movements.canDig=true
      movements.allow1by1towers=true
      movements.allowParkour=true
      movements.allowSprinting=true
      bot.pathfinder.setMovements(movements)
      console.log('🧭 Pathfinder ready')
      combat.init(bot)
      survival.init(bot)
      wood.init(bot)
      mining.init(bot)
      builder.init(bot)
      brain.init(bot)
      console.log('🧠 Herobrine AI ready')
    }catch(err){
      console.error('❌ Spawn initialization error:',err)
    }
  })

  bot.on('chat',(username,message)=>{
    if(username===bot.username)return
    console.log(`💬 ${username}: ${message}`)
    brain.chat(username,message)
  })

  bot.on('whisper',(username,message)=>{
    console.log(`📩 ${username}: ${message}`)
    brain.chat(username,message)
  })

  bot.on('error',err=>{
    console.error('❌ Bot error:',err.message)
  })

  bot.on('kicked',(reason)=>{
    console.error('⚠️ Bot kicked:',reason)
  })

  bot.on('death',()=>{
    console.log('☠️ Herobrine died')
    brain.onDeath()
  })

  bot.on('end',(reason)=>{
    console.error(`⚠️ Connection ended: ${reason||'unknown'}`)
    clearTimeout(reconnectTimer)
    reconnectTimer=setTimeout(startBot,reconnectDelay)
    reconnectDelay=Math.min(reconnectDelay*2,300000)
  })
}

process.on('uncaughtException',err=>console.error('❌ Uncaught exception:',err))
process.on('unhandledRejection',err=>console.error('❌ Unhandled rejection:',err))

startBot()
