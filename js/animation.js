// create Animation object
createAnimation = function() {

  let walk = false;
  let walk_start = 0;
  let walk_frame = 0;
  let walk_frame_duration = 125; // in milliseconds


  let punch = false;
  let punch_start = 0;
  let punch_frame = 0;
  let punch_frame_duration = 50; // in milliseconds

  let facing;


  let updateWalkAnimation = function(now, now_walking) {
    if (now_walking) {
      if (!walk) {
        walk_start = now; // reset start of walking animation
        walk = true;
      }
      walk_frame = (Math.floor((now - walk_start) % (walk_frame_duration*8) / walk_frame_duration));

    } else { // no walking -> either do not update, or stop animation
      if (walk) { // was walking but stopped
        walk = false;
        walk_frame = 0;
      }
    }
  }

  let updatePunchAnimation = function(now, now_punching) {
    if (now_punching) {
      if (!punch) {
        punch_start = now; // reset start of walking animation
        punch = true;
      }
      punch_frame = (Math.floor((now - punch_start) % (punch_frame_duration*3) / punch_frame_duration));

    } else { // no walking -> either do not update, or stop animation
      if (punch) { // was walking but stopped
        punch = false;
        punch_frame = 0;
      }
    }
  }

  return {
    getPlayerFrame: () => {
      if (punch) {
        let ox = facing*0.375+punch_frame*0.125+0.250;
        return [
          ox, 0.0,  ox+0.125, 0.0,  ox+0.125, 0.125, ox, 0.125
        ];
      } else if (walk) {
        let ox = walk_frame*0.125;
        let oy = facing*0.125+0.125;
        return [
          ox, oy,  ox+0.125, oy,  ox+0.125, oy+0.125, ox, oy+0.125
        ];
      } else {
        let ox = facing*0.125;
        return [
          ox, 0.0,  ox+0.125, 0.0,  ox+0.125, 0.125,  ox, 0.125
        ];
      }
    },
    update: (now, state) => {
      updateWalkAnimation(now, state[1] == 2);
      updatePunchAnimation(now, state[1] == 3);
      facing = state[0];
    }
  }

}
