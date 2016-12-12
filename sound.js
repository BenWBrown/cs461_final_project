// create Sound handling object
createSound = function() {

  let snd_punch = new Audio("punch.wav");

  return {
    punch: () => {
      console.log("punched");
      snd_punch.play();
    },
  }
}
