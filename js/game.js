let EPS = 0.00001;
let MIN_HEIGHT = -1.0;
let CHARACTER_WIDTH = 0.35; //TODO: IS THERE A BETTER NUMBER?
let PUNCH_DISTANCE = 0.1;
let PLATFORM_DISAPPEAR = 10;
let DEBUG = false;
let FAST = false;

// create Game object
createGame = function(numPlatforms, platformOffset) {
  let ay = -9.81; // gravity acceleration (unit/s^2)
  // create Player object

  let createLighting = function() {
    let atPlatform = undefined;
    let move_countdown = 0;
    let prevX = 0.0;
    let yOffset = 3.0;
    let zOffset = 3.0;
    let getX = function() {
      if (move_countdown > 0) {
        let dx = atPlatform.xOffset() + (atPlatform.heights.length -2) * atPlatform.scale/2 - prevX;

        return (prevX + dx*(400-move_countdown)/400);
      } else {
        return atPlatform.xOffset() + (atPlatform.heights.length -2) * atPlatform.scale/2;
      }
    }
    return {
      position: () => {
        if (atPlatform) {
          return [getX(), yOffset, zOffset, 1.0];
        } else {
          return [0.0, yOffset, zOffset, 1.0];
        }
      },
      moveto: (platform) => {
        if (atPlatform)
          prevX = atPlatform.xOffset() + (atPlatform.heights.length -2) * atPlatform.scale/2;
        move_countdown = 400;
        atPlatform = platform;
      },
      update: () => {
        if (move_countdown) {
          move_countdown = Math.max(move_countdown - elapsed, 0);
        }
      }
    }
  }


  let createAnimationData = function() {
    let walk = false;
    let walk_start = 0;
    let walk_frame = 0;

    let attack = false;
    let attack_start = 0;
    let attack_frame = 0;
    return {
      walk: walk, walk_start: walk_start, walk_frame: walk_frame,
      attack: attack, attack_start: attack_start, attack_frame: attack_frame
    }
  }

  let createPlayer = function() {
    let hp = 100,
      lives = 3,
      points = 0,
      x = 1.0,
      y = 2.0,
      z = 2.0,
      vx = 2.0, // unit/s
      vy = 0.0, // unit/s
      safety = false, // prevent player from walking off edge
      jump_count = 2,
      facing = 1,
      over = new Set(),
      onPlatform = undefined,
      punch_countdown = 0,  // attack animation countdown timer
      animation = createAnimationData();


    let left = function () {
      dx = -vx*elapsed/1000;
      walk(dx);
    };

    let right = function () {
      dx = vx*elapsed/1000;
      walk(dx);
    };

    let walk = function(dx) {
      if (!checkCollision(x, dx)) {
        if(FAST) dx *= 5;
        x += dx;
        if (onPlatform) {
          if (heightAt(onPlatform, x, z) > MIN_HEIGHT) {
            y = heightAt(onPlatform, x, z);
          }
        }
      }
      facing = dx > 0 ? 0 : 1;
    };

    let fall = function () {
      vy = 0;
      jump_count++;
      onPlatform = undefined;
    }

    let die = function() {
      if (!DEBUG) {
        if (lives <= 0) {
          console.log("gameover");
          //alert("game over");
        }
        vy = 0;
        jump_count++;
        onPlatform = undefined;
        x = 1.0;
        y = 0.0;
        z = 2.0;
        vy = 2.0;
        lives--;
      //  console.log("dead");
      }
    }

    let kill = function(enemy) {
      enemy.dead = true;
    }

    let jump = function () {
      if (jump_count < 2) {
        console.log("jump");
        vy = 3.0;
        jump_count++;
        onPlatform = undefined;
      }
    };

    let punch = function () {
      console.log("punch");
      sound.punch();
      punch_countdown = 150;
    };


    let checkCollision = function(x, dx) {
      if (onPlatform && safety && ((x+20*dx) < onPlatform.xOffset() ||
          (x+20*dx) > onPlatform.xOffset() + (onPlatform.heights.length -2) * onPlatform.scale)) {
        console.log("collide");
        return true;
      } else {
        return false;
      }
    };

    let heightAt = function(platform, x, z) {
      var xIndex = (x - platform.xOffset()) / platform.scale;
      var zIndex = (z / platform.scale);
      return platform.heightAtIndices(xIndex, zIndex);
    }

    let overPlatform = function(platform) {
      var newX = x - platform.xOffset();
      var xMax = (platform.heights.length -2) * platform.scale;
      var height = heightAt(platform, x, z);
      //console.log(zIndex, platform.heightAt(xIndex, zIndex));
      if (0 < newX && newX < xMax && y > height - EPS) {
        return "over";
      }
      if (0 < newX && newX < xMax) {
        return "under";
      }
      return "outside x";
    }

    // check if player has hit the ground, a platform, or an NPC
    let checkLanding = function() {
      platforms.forEach(function(platform){
        if (over.has(platform) && overPlatform(platform) == "under") {
          var xIndex = (x - platform.xOffset()) / platform.scale;
          var zIndex = (z / platform.scale);

          jump_count = 0;
          vy = 0;
          y = platform.heightAtIndices(xIndex, zIndex);
          onPlatform = platform;
          over.clear();
          lighting.moveto(onPlatform);
        }

        if (y <= -3) { //TODO: USE WATER HEIGHT
          //TODO: LOSE A LIFE
          jump_count = 0;
          vy = 0;
          y = -3;
        }
      });
    };

    let updateFall = function() {
      platforms.forEach(function(platform) {
        let status = overPlatform(platform);
        if (status == "over") {
          over.add(platform);
        } else if (status == "outside x") {
          over.delete(platform);
        }
      });
      vy += ay*elapsed/1000;
      y += vy*elapsed/1000;
    };

    let updateInput = function() {
      if (keyMap['W'.charCodeAt(0)]){
        jump();
        keyMap['W'.charCodeAt(0)] = false; // only jump once per press
      }

      if (keyMap[' '.charCodeAt(0)]){
        punch();
        keyMap[' '.charCodeAt(0)] = false; // only jump once per press
      }

      // if (punch_countdown) {
      //
      // } else {
        if (keyMap[37] || keyMap['A'.charCodeAt(0)]){ // char code 37: left arrow
          left();
        }else if (keyMap[39] || keyMap['D'.charCodeAt(0)]){ // char code 39: right arrow
          right();
        }
      //}
    }

    let checkEnemies = function(enemies) {
      let hitEnemy = undefined;
      let hitType = "nah";
      enemies.forEach(function(enemy) {
        if (over.has(enemy.platform) || onPlatform == enemy.platform) {
          if (Math.abs(enemy.position()[0] - x) <  CHARACTER_WIDTH) {
            hitEnemy = enemy;
            hitType = "die"
          }
          if (Math.abs(enemy.position()[0] - x) <  CHARACTER_WIDTH + PUNCH_DISTANCE
              && punch_countdown
              && ((facing == 0 && enemy.position()[0] > x) || (facing == 1 && enemy.position()[0] < x)) ) {
            hitEnemy = enemy;
            hitType = "punch";
          }
        }
      });
      return {hitEnemy: hitEnemy, hitType: hitType};
    }

    return {
      animation: animation,
      position: () => {
        return [x, y, z];
      },

      back: () => {
        dz = 3*elapsed/1000;
        z -= dz;
      },
      getState: () => { // used for animating sprite
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
      update: (enemies) => {
        var newEnemies = enemies;
        if (y < MIN_HEIGHT) {
          die();
        }
        let collision = checkEnemies(enemies);
        let hitEnemy = collision.hitEnemy
        if (hitEnemy) {
          if (collision.hitType == "die") {
            die();
            //console.log("die");
          } else if (collision.hitType == "punch") { //TODO: PROPERLY KILL ENEMY
            console.log("kill");
            let index = enemies.findIndex(function(e){return e==hitEnemy});
            newEnemies = enemies.slice(0, index).concat(enemies.slice(index+1));
          }
        }
        updateInput();
        if (jump_count) {
          updateFall();
          checkLanding();
        }
        if (punch_countdown) {
          punch_countdown = Math.max(punch_countdown - elapsed, 0);
        }
        return newEnemies
      }
    }
  }

  let createEnemy = function(platform) {

    let hp = 100,
      x = platform.xOffset() + (platform.heights.length -2) * platform.scale/2,
      y = 2.0,
      z = 1.95,
      vx = 1.0, // unit/s
      vy = 0.0, // unit/s

      move_count = 0, // countdown timer for movement
      facing = 0,
      over = new Set(),

      onPlatform = platform,

      attack_countdown = 0,

      animation = createAnimationData();

    let left = function () {
      dx = -vx*elapsed/1000;
      walk(dx);
    };

    let right = function () {
      dx = vx*elapsed/1000;
      walk(dx);
    };

    let walk = function(dx) {
      if (!checkCollision(x, dx)) {
        x += dx;
        if (onPlatform) {
          if (heightAt(onPlatform, x, z) > MIN_HEIGHT) {
            y = heightAt(onPlatform, x, z);
          }
        }
      }
      facing = dx > 0 ? 0 : 1;
    };

    let attack = function () {
      console.log("attack");
      // sound.slash();
      attack_countdown = 200;
    };

    let checkCollision = function(x, dx) {
      if (onPlatform && ((x+30*dx) < onPlatform.xOffset() ||
          (x+30*dx) > onPlatform.xOffset() + (onPlatform.heights.length -2) * onPlatform.scale)) {
        facing = 1 - facing;
        move_count = 0;
        return true;
      } else {
        return false;
      }
    };

    let heightAt = function(platform, x, z) {
      var xIndex = (x - platform.xOffset()) / platform.scale;
      var zIndex = (z / platform.scale);
      return platform.heightAtIndices(xIndex, zIndex);
    }

    y = heightAt(platform, x, z);

    return {
      animation: animation,
      platform: platform,
      position: () => {
        return [x, y, z];
      },
      getState: () => { // used for animating sprite
        result = [0, 0];
        result[0] = facing;
        if (attack_countdown) {
          result[1] = 3;
        } else if (move_count > 0 && direction <= 1) {
          result[1] = 2; // walking
        }
        return result;
      },
      update: () => {
        if (onPlatform && move_count > 0) {
          move_count -= elapsed;
          if (direction == 1) {
            left();
          } else if (direction == 0){
            right();
          }
        } else if (onPlatform) {
          // console.log(move_count);
          move_count = (Math.random()+0.5) * 2000;
          direction = (Math.random() > 0.8 ? 5 : (Math.random() > 0.4 ? 1 : 0));
        }
        // if (!onPlatform) {
        //   jump();
        // }
        // if (jump_count) {
        //   updateFall();
        //   checkLanding();
        // }
        // if (attack_countdown) {
        //   attack_countdown = Math.max(attack_countdown - elapsed, 0);
        // }
      }
    }
  }

  // game globals
  let lighting = createLighting();
  let platforms = [];
  let player = createPlayer();
  let enemies = [];
  let waterTiles = [];

  return {
    player: player,
    update: () => {
      lighting.update();
      let newEnemies = player.update(enemies);
      enemies = newEnemies;
      enemies.forEach(function(enemy){
        enemy.update();
      });
      // if (keyMap['F'.charCodeAt(0)]){
      //   player.back();
      // }
      if (player.position()[0] - platforms[0].xOffset() > PLATFORM_DISAPPEAR) {
        console.log("platform moved");
        let platform = platforms.shift();
        if (platform.shouldHaveEnemy) {
          platform.shiftPlatform(numPlatforms, platformOffset);
          enemies.push(createEnemy(platform));
          platforms.push(platform);
        }
      }
    },
    enemies: () => {return enemies},
    platforms: platforms,
    waterTiles: waterTiles,
    addPlatform: (platform, shouldHaveEnemy) => {
      platforms.push(platform);
      if (shouldHaveEnemy) enemies.push(createEnemy(platform));
    },
    lighting: lighting
  }

}
