window.onload = function(){
  let canvas = document.getElementById('canvas');
  let gl;
  // catch the error from creating the context since this has nothing to do with the code
  try{
    gl = middUtils.initializeGL(canvas);
  } catch (e){
    alert('Could not create WebGL context');
    return;
  }

  // don't catch this error since any problem here is a programmer error
  let program = middUtils.initializeProgram(gl, vertexShader, fragmentShader);


  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.4,0.6,1,1);

  var then = 0;
  let render = function(now){
    var elapsed = now - then;
    then = now;
    
    //requestAnimationFrame(render);
  };
}
