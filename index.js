const http=require('http')
const mineflayer=require('mineflayer')
const {pathfinder,Movements}=require('mineflayer-pathfinder')
const combat=require('./combat/combat')
const brain=require('./ai/brain')
const survival=require('./survival/survival')

const server=http.createServer((req,res)=>{
  res.writeHead(200,{'Content-Type':'text/plain'})
  res.end('Herobrine AI is running')
})
server.listen(process.env.PORT||10000,()=>console.log('🌐 Web server running'))

let bot
let reconnectTimer
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
    const movements=new Movements(bot)
    movements.canDig=true
    movements.allowParkour=true
    movements.allowSprinting=true
    bot.pathfinder.setMovements(movements)
    combat.init(bot)
    brain.init(bot)
    survival.init(bot)
  })

  bot.on('chat',(username,message)=>{
    if(username===bot.username)return
    console.log(`💬 ${username}: ${message}`)
    brain.chat(username,message)
  })

  bot.on('error',err=>console.error('❌ Bot error:',err.message))

  bot.on('kicked',reason=>console.error('⚠️ Bot kicked:',reason))

  bot.on('end',()=>{
    console.error(`⚠️ Connection ended. Reconnecting in ${reconnectDelay/1000}s...`)
    clearTimeout(reconnectTimer)
    reconnectTimer=setTimeout(startBot,reconnectDelay)
    reconnectDelay=Math.min(reconnectDelay*2,300000)
  })
}

startBot()
