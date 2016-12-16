// create Animation object
createAnimation = function() {

  let walk = false;
  let walk_start = 0;
  let walk_frame = 0;
  let walk_frame_duration = 125; // in milliseconds


  // let punch = false;
  // let punch_start = 0;
  // let punch_frame = 0;
  let attack_frame_duration = 50; // in milliseconds

  let facing;


  let updateWalkAnimation = function(character, now, now_walking) {
    let anim = character.animation;
    if (now_walking) {
      if (!anim.walk) {
        anim.walk_start = now; // reset start of walking animation
        anim.walk = true;
      }
      anim.walk_frame = (Math.floor((now - anim.walk_start) % (walk_frame_duration*8) / walk_frame_duration));

    } else { // no walking -> either do not update, or stop animation
      if (anim.walk) { // was walking but stopped
        anim.walk = false;
        anim.walk_frame = 0;
      }
    }
  }

  let updateAttackAnimation = function(character, now, now_attacking) {
    let anim = character.animation;
    if (now_attacking) {
      if (!anim.attack) {
        anim.attack_start = now; // reset start of walking animation
        anim.attack = true;
      }
      anim.attack_frame = (Math.floor((now - anim.attack_start) % (attack_frame_duration*3) / attack_frame_duration));

    } else { // no walking -> either do not update, or stop animation
      if (anim.attack) { // was walking but stopped
        anim.attack = false;
        anim.attack_frame = 0;
      }
    }
  }

  // let updateAttackAnimation = function(enemy, now, now_attacking) {
  //   if (enemy.now_attacking) {
  //     if (!enemy.attack_animation) {
  //       enemy.attack_start = now; // reset start of walking animation
  //       enemy.attack_animation = true;
  //     }
  //     attack_frame = (Math.floor((now - attack_start) % (attack_frame_duration*3) / attack_frame_duration));
  //
  //   } else { // no walking -> either do not update, or stop animation
  //     if (enemy.attack_animation) { // was attacking but stopped
  //       enemy.attack_animation = false;
  //       enemy.attack_frame = 0;
  //     }
  //   }
  // }

  return {
    getCharacterFrame: (character) => {
      if (character.animation.attack) {
        let ox = character.getState()[0]*0.375+character.animation.attack_frame*0.125+0.250;
        return [
          ox, 0.0,  ox+0.125, 0.0,  ox+0.125, 0.125, ox, 0.125
        ];
      } else if (character.animation.walk) {
        let ox = character.animation.walk_frame*0.125;
        let oy = character.getState()[0]*0.125+0.125;
        return [
          ox, oy,  ox+0.125, oy,  ox+0.125, oy+0.125, ox, oy+0.125
        ];
      } else {
        let ox = character.getState()[0]*0.125;
        return [
          ox, 0.0,  ox+0.125, 0.0,  ox+0.125, 0.125,  ox, 0.125
        ];
      }
    },
    update: (game, now) => {
      updateWalkAnimation(game.player, now, game.player.getState()[1] == 2);
      updateAttackAnimation(game.player, now, game.player.getState()[1] == 3);
      game.enemies.forEach(function(enemy){
        updateWalkAnimation(enemy, now, enemy.getState()[1] == 2);
        updateAttackAnimation(enemy, now, enemy.getState()[1] == 3);
      });

      // updateattackAnimation(now, state[1] == 3);
      // facing = state[0];
    }
  }

}
