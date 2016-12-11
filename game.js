createPlayer = function() {
  let hp = 100,
    points = 0,
    // w = 0.5;
    x = 0.0,
    y = 0.0,
    vy = 0.0,
    ay = -0.01, // gravity acceleration
    falling = false;


  let checkCollision = function(environment) {
    return false;
  };

  // check if player has hit the ground, a platform, or an NPC
  let checkLanding = function(environment, npcs) {
    if (y <= 0) {
      falling = false;
      vy = 0;
    }
  };

  let updateFall = function() {
    y += vy;
    vy += ay;
    console.log(y);
  };

  return {
    position: () => {
      return [x, y];
    },
    update: (environment, npcs) => {


      if (falling) {
        updateFall();
        checkLanding(environment, npcs);
      }
    },
    jump: () => {
      if (!falling) {
        console.log("jump");
        vy = 0.1;
        falling = true;
      }
    },
    walk: (dx) => {
      if (!checkCollision(x, x+dx)) {
        x += dx;
        console.log(x);
      }
    }
  }
}

createEnvironment = function() {
  return {};
}

createGame = function() {

  let environment = createEnvironment(); // physical environment
  let player = createPlayer();
  let npcs = [];

  let updateInput = function(keyMap) {
    if (keyMap[' '.charCodeAt(0)]){
      console.log("jump");
      player.jump();
    }

    if (keyMap[37] || keyMap['A'.charCodeAt(0)]){ // char code 37: left arrow
      player.walk(-0.05);
    }else if (keyMap[39] || keyMap['D'.charCodeAt(0)]){ // char code 39: right arrow
      player.walk(0.05);
    }
  }

  return {
    player: player,
    update: (keyMap) => {
      updateInput(keyMap);
      player.update(environment);
    }
  }

}
