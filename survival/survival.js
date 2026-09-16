let bot
let foodTimer

function init(b){
  bot=b
  foodTimer=setInterval(checkFood,5000)
}

function checkFood(){
  if(!bot||!bot.entity)return

  if(bot.food<=8){
    const food=bot.inventory.items().find(i=>/bread|beef|porkchop|chicken|mutton|carrot|potato|apple/.test(i.name))

    if(food){
      bot.equip(food,'hand').then(()=>{
        if(bot.food<18)bot.consume()
      }).catch(()=>{})
    }
  }
}

module.exports={init}
