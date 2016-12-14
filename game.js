
// create Player object
createPlayer = function() {
  let hp = 100,
    points = 0,
    // w = 0.5;
    x = 0.0,
    y = 0.0,
    z = 1.0,
    vx = 1.0, // unit/s
    vy = 0.0, // unit/s
    ay = -9.81, // gravity acceleration (unit/s^2)
    jump_count = 0,
    facing = 1

    punch_countdown = 0;


  let left = function (elapsed) {
    dx = -vx*elapsed/1000;
    if (!checkCollision(x, x+dx)) {
      x += dx;
      // console.log(x);
    }
    facing = 1;
  };
  let right = function (elapsed) {
    dx = vx*elapsed/1000;
    if (!checkCollision(x, x+dx)) {
      x += dx;
      // console.log(x);
    }
    facing = 0;
  };


  let jump = function () {
    if (jump_count < 2) {
      console.log("jump");
      vy = 3.0;
      jump_count++;
    }
  };

  let punch = function (sound) {
    console.log("punch");
    sound.punch();
    punch_countdown = 150;
  };

  let checkCollision = function(environment) {
    return false;
  };

  // check if player has hit the ground, a platform, or an NPC
  let checkLanding = function(environment, npcs) {
    if (y <= 0) {
      jump_count = 0;
      vy = 0;
      y = 0;
    }
  };

  let updateFall = function(elapsed) {
    y += vy*elapsed/1000;
    vy += ay*elapsed/1000;
  };

  let updateInput = function(keyMap, elapsed) {
    if (keyMap['W'.charCodeAt(0)]){
      jump();
      keyMap['W'.charCodeAt(0)] = false; // only jump once per press
    }

    if (keyMap[' '.charCodeAt(0)]){
      punch(sound);
      keyMap[' '.charCodeAt(0)] = false; // only jump once per press
    }

    if (punch_countdown) {

    } else {
      if (keyMap[37] || keyMap['A'.charCodeAt(0)]){ // char code 37: left arrow
        left(elapsed);
      }else if (keyMap[39] || keyMap['D'.charCodeAt(0)]){ // char code 39: right arrow
        right(elapsed);
      }
    }
  }

  return {
    position: () => {
      return [x, y, z];
    },

    back: (elapsed) => {
      dz = 3*elapsed/1000;
      z -= dz;
    },
    getState: (keyMap) => { // used for animating sprite
      result = [0, 0];
      result[0] = facing;
      if (punch_countdown) {
        result[1] = 3;
      } else if (jump_count) {
        result[1] = 1; // falling
      } else if (keyMap[37] || keyMap['A'.charCodeAt(0)] ||
                 keyMap[39] || keyMap['D'.charCodeAt(0)]) {
        result[1] = 2; // walking
      }
      return result;
    },
    update: (elapsed, keyMap, sound, environment, npcs) => {
      updateInput(keyMap, elapsed, sound);
      if (jump_count) {
        updateFall(elapsed);
        checkLanding(environment, npcs);
      }
      if (punch_countdown) {
        punch_countdown = Math.max(punch_countdown - elapsed, 0);
      }
    }
  }
}

// create Environment object
createEnvironment = function() {
  let height = [0, 1, 2]; //TODO: GENERATE HEIGHT RANDOMLY
  return {
    height: height,
    heightAt: (xCoord)=>{
      if (xCoord < 0) {
        let x = Math.floor(1-Math.floor(xCoord) / height.length) * height.length;
        xCoord += x;//I think this works but haven't tested it yet
      }
      let left = Math.floor(xCoord) % height.length;
      let right = Math.ceil(xCoord) % height.length;
      let weight = 1 - (xCoord - left);
      return height[left] * weight + height[right] * (1 - weight);
    },
  };
}

// create Game object
createGame = function() {

  let environment = createEnvironment(); // physical environment
  let platforms = []
  let player = createPlayer();
  let npcs = [];



  return {
    player: player,
    update: (elapsed, keyMap, sound) => {
      // updateInput(keyMap, elapsed);
      player.update(elapsed, keyMap, sound, environment, npcs);
      if (keyMap['F'.charCodeAt(0)]){
        player.back(elapsed);
      }
    },
    platforms: platforms,
    addPlatform: (platform) => {
      platforms.push(platform);
    }
  }

}
