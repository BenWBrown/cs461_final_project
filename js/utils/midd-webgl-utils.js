
var middUtils = (function(){


  /**
  Given a canvas object, this gets the WebGL context from it. It also sets the
  viewport to fill the canvas.

  @arg canvas - A reference to a valid canvas object in the DOM
  @return webgl context
  */
  var initializeGL = function(canvas){
    // get the context handle for rendering webgl in the canvas
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // set the resolution of the context to match the canvas
    gl.viewport(0,0,canvas.width, canvas.height);
    return gl;
  };


  /**
    Creates, loads and compiles a shader.

    This will probably not need to be called directly.

    @arg gl - a webgl context
    @arg shaderSource - a string containing source for a shader
    @arg type - type of shader; gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    @return reference to compiled shader

    @throws error if shader cannot be compiled
  */
  var initializeShader = function(gl, shaderSource, type){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (! gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
      gl.deleteShader(shader);
      throw "Unable to compile " + (type === gl.VERTEX_SHADER ? 'vertex': 'fragment') + " shader";
    }

    return shader;
  };


  /**
    Create a new program given vertex and fragment shaders.

    The vertex and fragment shaders are passed in as strings.

    @arg gl - the webgl context
    @arg vertexShaderSource - string containg the vertex shader
    @arg fragmentShaderSource - string containing the fragment shader
    @return reference to the compiled and linked program

    @throws error if program cannot be linked
    */
  var initializeProgram = function(gl, vertexShaderSource, fragmentShaderSource){
    var vertexShader = initializeShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fragmentShader = initializeShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw "Unable to initialize the shader program: " + gl.getProgramInfoLog(shader);
    }

    gl.useProgram(program);

    return program;
  };

  return {
    initializeGL: initializeGL,
    initializeShader: initializeShader,
    initializeProgram: initializeProgram
  };

})();
