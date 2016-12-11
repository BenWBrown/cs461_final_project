var createCamera = function() {

  let position = [0.0, 0.5, 7.0];
  return {
    set: (pos) => {
      position = pos;
    },
    eye: () => {
      return position;
    },
    update: (game) => {
      position[0] = game.player.position()[0];
      position[1] = game.player.position()[1]+0.5;
      // console.log(game.player.position);
    },
    apply: (transform) => {
      let eye = vec3.fromValues(position[0], position[1], position[2]);
      let up = vec3.fromValues(0,1,0);
      let at = vec3.fromValues(position[0], position[1], position[2]-1.0);

      mat4.lookAt(transform, eye, at, up);
    }
  }
}



// not to be used in final code, just for rendering demo purposes
var createFloor = function(gl, program, size){
  let floor = {
    vertices :  new Float32Array([
      0.0, 0.0, 0.0,  0.0, 0.0, size,  size, 0.0, size,  size, 0.0, 0.0
    ]),

    normals : new Float32Array([
      0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0,  0.0, 1.0, 0.0
    ]),

    textureCoordinates : new Float32Array([
      size, size,  0.0, size, 0.0, 0.0, size, 0.0
    ]),

    indices : new Uint8Array([
      0,1,2,  0,2,3,
    ])

  };


  floor.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, floor.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, floor.vertices, gl.STATIC_DRAW);

  floor.normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, floor.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, floor.normals, gl.STATIC_DRAW);

  floor.textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, floor.textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, floor.textureCoordinates, gl.STATIC_DRAW);

  floor.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floor.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, floor.indices, gl.STATIC_DRAW);


  return function(){
    gl.uniform1i(program.u_Sampler, 0); // texture 1: floor
    gl.bindBuffer(gl.ARRAY_BUFFER, floor.vertexBuffer);
    gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, 0,0);

    gl.bindBuffer(gl.ARRAY_BUFFER, floor.textureBuffer);
    gl.vertexAttribPointer(program.a_TexCoord, 2, gl.FLOAT, false, 0,0);

    if (program.a_Normal !== undefined){
      // only enable the normal buffer if the program supports it
      gl.bindBuffer(gl.ARRAY_BUFFER, floor.normalBuffer);
      gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0,0);
    }

    if (program.a_Color !== undefined){
      // only enable the normal buffer if the program supports it
      gl.bindBuffer(gl.ARRAY_BUFFER, floor.normalBuffer);
      gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0,0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floor.indexBuffer);
    gl.drawElements(gl.TRIANGLES, floor.indices.length, gl.UNSIGNED_BYTE, 0);

  };
};




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

  // load referneces to the vertex attributes as properties of the program
  program.a_Position = gl.getAttribLocation(program, 'a_Position');
  if (program.a_Position < 0) {
      console.log('Failed to get position storage location');
      return -1;
  }
  gl.enableVertexAttribArray(program.a_Position);

  // load referneces to the texture coordinate attributes as properties of the program
  program.a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
  if (program.a_TexCoord < 0) {
      console.log('Failed to get texture coordinate storage location');
      return -1;
  }
  gl.enableVertexAttribArray(program.a_TexCoord);


  // specify the association between the VBO and the a_Normal attribute
  program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
  if (program.a_Normal < 0) {
      console.log('Failed to get normal storage location');
      return -1;
  }
  gl.enableVertexAttribArray(program.a_Normal);


  // gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.DEPTH_TEST);

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  gl.clearColor(0.4,0.6,1,1); // sky color

  let u_Transform = gl.getUniformLocation(program, 'u_Transform');
  let u_Projection = gl.getUniformLocation(program, 'u_Projection');
  let u_View = gl.getUniformLocation(program, 'u_View');


  program.u_Sampler = gl.getUniformLocation(program, 'u_Sampler');


  program.u_LightDirection = gl.getUniformLocation(program, "u_LightDirection");
  program.u_Ambient = gl.getUniformLocation(program, 'u_Ambient');
  program.u_Diffuse = gl.getUniformLocation(program, 'u_Diffuse');
  program.u_Specular = gl.getUniformLocation(program, 'u_Specular');


  gl.uniform3f(program.u_LightDirection, 0.0, 1.0, 0.0);
  gl.uniform3f(program.u_Ambient, 0.2, 0.2, 0.2);
  gl.uniform3f(program.u_Diffuse, 0.7, 0.7, 0.7);
  gl.uniform3f(program.u_Specular, 0.8, 0.8, 0.8);


  camera = createCamera();

  // create key listener
  var keyMap = {};

  window.onkeydown = function(e){
      keyMap[e.which] = true;
  }

  window.onkeyup = function(e){
       keyMap[e.which] = false;
  }


  // create game object (stores layout, player, NPCs)
  game = createGame();


  var now = 0;
  var then = 0;
  drawGrass = createFloor(gl, program, 5.0);
  let render = function(now){
    if (then)
      var elapsed = now - then;
    then = now;

    game.update(keyMap);

    camera.update(game);


    // draw:
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(u_Transform, false, mat4.create());

    let projection = mat4.create();
    mat4.perspective(projection, Math.PI/3,1, 0.1,55);
    gl.uniformMatrix4fv(u_Projection, false, projection);

    let view = mat4.create();
    camera.apply(view);
    gl.uniformMatrix4fv(u_View, false, view);


    drawGrass();

    requestAnimationFrame(render);
  };



  // load textures
  let texture_grass = gl.createTexture();
  let image_grass = new Image();

  image_grass.onload = ()=>{
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_grass);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image_grass);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

    render();
  };

  image_grass.src = 'grass.png';
}
