// create Sound handling object
createSound = function() {

  let snd_punch = new Audio("../audio/punch.wav");

  return {
    punch: () => {
      snd_punch.play();
    },
  }
}
