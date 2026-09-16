const memory={
  home:null,
  attacker:null,
  lastAttack:0,
  rage:false,
  knownPlayers:{},
  killedAttackers:{}
}

function setAttacker(player){
  memory.attacker=player
  memory.lastAttack=Date.now()
  memory.rage=true
}

function forgetAttacker(){
  if(memory.attacker)memory.killedAttackers[memory.attacker]=Date.now()
  memory.attacker=null
  memory.rage=false
}

module.exports={memory,setAttacker,forgetAttacker}
