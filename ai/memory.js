const state={
  home:null,
  rage:false,
  attacker:null,
  lastAction:null,
  lastActionAt:0,
  busy:false,
  started:false,
  knownPlayers:{}
}

function setHome(pos){
  state.home={x:pos.x,y:pos.y,z:pos.z}
}

function setAttacker(entity){
  state.rage=true
  state.attacker=entity
}

function forgetAttacker(){
  state.rage=false
  state.attacker=null
}

function rememberPlayer(username){
  state.knownPlayers[username]=Date.now()
}

function action(name){
  state.lastAction=name
  state.lastActionAt=Date.now()
}

module.exports={state,setHome,setAttacker,forgetAttacker,rememberPlayer,action}
