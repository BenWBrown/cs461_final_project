// create Sound handling object
createSound = function() {

  let snd_punch = new Audio("../audio/punch.wav");
  let snd_grunt = new Audio("../audio/grunt.wav");

  return {
    punch: () => {
      snd_punch.play();
    },
    grunt: () => {
      snd_grunt.play();
    }
  }
}
