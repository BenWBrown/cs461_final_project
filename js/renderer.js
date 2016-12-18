var createCamera = function() {

  let position = [0.0, 1.5, 5.5];
  return {
    set: (pos) => {
      position = pos;
    },
    eye: () => {
      return position;
    },
    update: (game) => {
      position[0] = game.player.position()[0];
      // position[1] = game.player.position()[1]+0.5;
      // console.log(game.player.position);
    },
    apply: (transform) => {
      let eye = vec3.fromValues(position[0], position[1], position[2]);
      let up = vec3.fromValues(0,1,0);
      let at = vec3.fromValues(position[0], position[1]-0.5, position[2]-1.0);

      mat4.lookAt(transform, eye, at, up);
    }
  }
}



// not to be used in final code, just for rendering demo purposes
var createFloor = function(gl, program, size){
  w = 1.0;
  h = 1.0;
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



  floor.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floor.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, floor.indices, gl.STATIC_DRAW);


  return function(){
    gl.uniform1i(program.u_Sampler, 1); // texture 0: grass
    gl.uniform1i(program.u_NormalMap, 0); // texture 4: blank normal map
    gl.bindBuffer(gl.ARRAY_BUFFER, floor.vertexBuffer);
    gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, 0,0);

    floor.textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floor.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floor.textureCoordinates, gl.STATIC_DRAW);


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


var createCharacterSprite = function(gl, program, w, h, texID) {
  let player = {
    w : w,
    h : h,

    normals : new Float32Array([
      0.0, 0.5, 0.0,  0.0, 0.5, 0.0,  0.0, 0.5, 0.0,  0.0, 0.5, 0.0
    ]),

    indices : new Uint8Array([
      0,1,2,  0,2,3,
    ])

  };

  player.normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, player.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, player.normals, gl.STATIC_DRAW);

  player.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, player.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, player.indices, gl.STATIC_DRAW);

  return function(pos, frame){
    gl.uniform1i(program.u_Sampler, texID); // sprite texture
    gl.uniform1i(program.u_NormalMap, 4); // texture 4: character normal map


    // finish filling buffers

    player.vertices = new Float32Array([
      pos[0]-w/2, h+pos[1], pos[2],  pos[0]+w/2, h+pos[1], pos[2],  pos[0]+w/2, pos[1], pos[2],  pos[0]-w/2, pos[1], pos[2]
    ])
    player.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, player.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, player.vertices, gl.STATIC_DRAW);

    player.textureCoordinates = new Float32Array(frame);
    player.textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, player.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, player.textureCoordinates, gl.STATIC_DRAW);



    gl.bindBuffer(gl.ARRAY_BUFFER, player.vertexBuffer);
    gl.vertexAttribPointer(program.a_Position, 3, gl.FLOAT, false, 0,0);


    gl.bindBuffer(gl.ARRAY_BUFFER, player.textureBuffer);
    gl.vertexAttribPointer(program.a_TexCoord, 2, gl.FLOAT, false, 0,0);

    if (program.a_Normal !== undefined){
      // only enable the normal buffer if the program supports it
      gl.bindBuffer(gl.ARRAY_BUFFER, player.normalBuffer);
      gl.vertexAttribPointer(program.a_Normal, 3, gl.FLOAT, false, 0,0);
    }

    if (program.a_Color !== undefined){
      // only enable the normal buffer if the program supports it
      gl.bindBuffer(gl.ARRAY_BUFFER, player.normalBuffer);
      gl.vertexAttribPointer(program.a_Color, 3, gl.FLOAT, false, 0,0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, player.indexBuffer);
    gl.drawElements(gl.TRIANGLES, player.indices.length, gl.UNSIGNED_BYTE, 0);

  };
}

// create mesh draw
var createMesh = function(gl, program, field, texStretch = 2.0, swapYZ = false){
  let textureID = field.textureID;
  let oy = field.yOffset;
  let ox = field.xOffset;
  let oz = field.zOffset;
  let heights = field.heights;
  let normals = field.normals;
  let diffuse = field.diffuse;
  let specular = field.specular;
  let shininess = field.shininess;
  let size = heights.length-1;
  let scale = field.scale ? field.scale : 1;
  let tempVertices = [];
  let tempTexCoords = [];
  let tempIndices = [];
  let tempNormals = [];
  let i = 0;
  for (let z = 0; z < size; z++) {
    for (let x = 0; x < size; x++) {
      y = heights[x][z];
      if (!swapYZ) {tempVertices.push(x * scale + ox, y+oy, z * scale + oz);}
      else {tempVertices.push(x * scale + ox, z * scale +oy, y + oz);}
      if (z<normals[x].length) {
        tempTexCoords.push(texStretch*x/size, texStretch*z/size);
        tempNormals.push(normals[x][z][0],
                         normals[x][z][1],
                         normals[x][z][2]);
      }else {
        tempTexCoords.push(x/size, z/size);
        tempNormals.push(0.0, 1.0, 0.0);
      }
      tempIndices.push(i+size, i);
      i += 1;
    }
  }
  var map = {

      vertices : new Float32Array(tempVertices),
      textureCoordinates: new Float32Array(tempTexCoords),
      normals: new Float32Array(tempNormals),
      indices: new Uint16Array(tempIndices),

      dimensions: 3,
    };

  map.vertexBuffer = gl.createBuffer();
  map.textureBuffer = gl.createBuffer();
  map.normalBuffer = gl.createBuffer();
  map.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, map.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, map.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, map.textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, map.textureCoordinates, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, map.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, map.normals, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, map.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, map.indices, gl.STATIC_DRAW);


  return function(){

    gl.uniform1i(program.u_Sampler, textureID);
    gl.uniform1i(program.u_NormalMap, 0); // texture 4: blank normal map


    gl.bindBuffer(gl.ARRAY_BUFFER, map.vertexBuffer);
    // associate it with our position attribute
    gl.vertexAttribPointer(program.a_Position, map.dimensions, gl.FLOAT, false, 0,0);

    gl.bindBuffer(gl.ARRAY_BUFFER, map.textureBuffer);
    // associate it with our position attribute
    gl.vertexAttribPointer(program.a_TexCoord, 2, gl.FLOAT, false, 0,0);

    gl.bindBuffer(gl.ARRAY_BUFFER, map.normalBuffer);
    // associate it with our position attribute
    gl.vertexAttribPointer(program.a_Normal, map.dimensions, gl.FLOAT, false, 0,0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, map.indexBuffer);

    for (let s = 0; s < size-1; s++) {
      gl.drawElements(gl.TRIANGLE_STRIP, size*2, gl.UNSIGNED_SHORT, s*size*4);
    }
  };
};


function initializeTexture(gl, textureid, filename, use_mipmap) {
  return new Promise(function(resolve, reject){
    var texture = gl.createTexture();

    var image = new Image();
    image.onload = function(){

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.activeTexture(textureid);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        if (use_mipmap) {
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        }
        resolve();
    }


    image.onerror = function(error){

        reject(Error(filename));
    }

    image.src = filename;
  });
}

function initializeProgram(gl, vertexShader, fragmentShaderp) {
  // don't catch this error since any problem here is a programmer error
  let program = middUtils.initializeProgram(gl, vertexShader, fragmentShader);

  // load referneces to the vertex attributes as properties of the program
  program.a_Position = gl.getAttribLocation(program, 'a_Position');
  if (program.a_Position < 0) {
      console.log('Failed to get position storage location');
      return -1;
  }
  // load referneces to the texture coordinate attributes as properties of the program
  program.a_TexCoord = gl.getAttribLocation(program, 'a_TexCoord');
  if (program.a_TexCoord < 0) {
      console.log('Failed to get texture coordinate storage location');
      return -1;
  }
  // specify the association between the VBO and the a_Normal attribute
  program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
  if (program.a_Normal < 0) {
      console.log('Failed to get normal storage location');
      return -1;
  }

  program.u_Sampler = gl.getUniformLocation(program, 'u_Sampler');
  program.u_NormalMap = gl.getUniformLocation(program, 'u_NormalMap');
  // program.u_TransparentColor = gl.getUniformLocation(program, 'u_TransparentColor');


  program.u_LightDirection = gl.getUniformLocation(program, "u_LightDirection");
  program.u_LightPosition = gl.getUniformLocation(program, "u_LightPosition");
  program.u_Ambient = gl.getUniformLocation(program, 'u_Ambient');
  program.u_Diffuse = gl.getUniformLocation(program, 'u_Diffuse');
  program.u_Specular = gl.getUniformLocation(program, 'u_Specular');

  return program;
}


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


  let program = initializeProgram(gl, vertexShader, fragmentShader);

  gl.enableVertexAttribArray(program.a_Position);


  gl.enableVertexAttribArray(program.a_TexCoord);


  gl.enableVertexAttribArray(program.a_Normal);


  gl.enable(gl.DEPTH_TEST);
  // gl.disable(gl.DEPTH_TEST);

  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  // gl.enable(gl.BLEND);

  gl.clearColor(0.3,0.5,0.9,1); // sky color
  gl.clearColor(0.0,0.0,0.1,1); // black

  let u_Transform = gl.getUniformLocation(program, 'u_Transform');
  let u_Projection = gl.getUniformLocation(program, 'u_Projection');
  let u_View = gl.getUniformLocation(program, 'u_View');





  gl.uniform3f(program.u_LightDirection, 0.5, 1.0, 0.5);
  gl.uniform3f(program.u_Ambient, 0.2, 0.2, 0.2);
  // gl.uniform3f(program.u_Ambient, 0.9, 0.9, 0.9);
  gl.uniform3f(program.u_Diffuse, 0.8, 0.8, 0.8);
  // gl.uniform3f(program.u_Specular, 0.8, 0.8, 0.8);


  camera = createCamera();

  // create key listener
  keyMap = {};

  window.onkeydown = function(e){
      keyMap[e.which] = true;
      if (keyMap['Y'.charCodeAt(0)]) {
        initializeTexture(gl, gl.TEXTURE3,'../images/player-white.png')
      }
  }

  window.onkeyup = function(e){
       keyMap[e.which] = false;
  }




  // create game object (stores layout, player, NPCs)
  game = createGame();

  // create animation handler
  animation = createAnimation();

  // create sound handler
  sound = createSound();


  gl.uniform4fv(program.u_LightPosition, new Float32Array(game.lighting.position()));

  let startingPlatform = createPlatform(game, 1, 4, 0, 0, 0, 0.25, false);

  for (var i = 0; i < 2; i++) {
    createPlatform(game, 1, 4, 0, (i+1) * 4, 0, 0.25, true); //game, textureID, size, y-offset, x-offset, z-offset, scale, shouldHaveEnemy
  }

  // platform1 = createPlatform(game, 1, 4, 0, 1, 0.25);  //game, textureID, size, y-offset, x-offset, z-offset, scale
  // platform2 = createPlatform(game, 1, 4, 0, -3, 0.25); //game, textureID, size, y-offset, x-offset, z-offset, scale
  water = createWater(game, 2, 8, -1.0, -10, -20, 0.25);

  var now = 0;
  var then = 0;
  //drawGrass = createFloor(gl, program, 5.0);
  drawPlayer = createCharacterSprite(gl, program, 1.0, 1.0, 3);
  drawEnemy = createCharacterSprite(gl, program, 1.0, 1.0, 5);
  drawPlatforms = function() {
    game.platforms.forEach(function(platform) {
      var drawMesh = createMesh(gl, program, platform)
      drawMesh();
    });
  };
  //drawPlatforms = createMesh(gl, program, platform1, platform1.textureID, platform1.yOffset, platform1.xOffset);
  drawWater = createMesh(gl, program, water, 10.0);

  sky = createSky(game, 6, 0, 1, -7);
  drawSky = createMesh(gl, program, sky, 5, true);


  elapsed = 0;
  let render = function(now){
    if (then)
      elapsed = now - then;
    then = now;


    // lighting demo:
    angle = (Math.PI/2) * now/2000;
    gl.uniform3f(program.u_LightDirection, Math.cos(angle), Math.abs(Math.sin(angle)), 0.4);


    game.update();

    gl.uniform4fv(program.u_LightPosition, new Float32Array(game.lighting.position()));

    camera.update(game);

    animation.update(game, now, game.player.getState(keyMap));


    // draw:
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(u_Transform, false, mat4.create());

    let projection = mat4.create();
    mat4.perspective(projection, Math.PI/3,1, 0.1,75);
    gl.uniformMatrix4fv(u_Projection, false, projection);

    let view = mat4.create();
    camera.apply(view);
    gl.uniformMatrix4fv(u_View, false, view);


    drawPlatforms();
    drawWater();

    let transform = mat4.create();
    mat4.fromTranslation(transform, vec3.fromValues(camera.eye()[0] - 1 - sky.scale/2, 0, 0));
    //console.log(transform);
    gl.uniformMatrix4fv(u_Transform, false, transform);
    gl.uniform3f(program.u_Ambient, 2, 2, 2);
    drawSky();
    gl.uniformMatrix4fv(u_Transform, false, mat4.create());
    gl.uniform3f(program.u_Ambient, 0.2, 0.2, 0.2);

    drawPlayer(game.player.position(),
      animation.getCharacterFrame(game.player));

    game.enemies().forEach(function(enemy){
      drawEnemy(enemy.position(),
        animation.getCharacterFrame(enemy));
    });
    //console.log(game.enemies.length);

    requestAnimationFrame(render);
  };


  Promise.all([
    initializeTexture(gl, gl.TEXTURE0, '../images/blank_normal.png'),
    initializeTexture(gl, gl.TEXTURE1,'../images/grass.png', true),
    initializeTexture(gl, gl.TEXTURE2,'../images/water.jpg', true),
    initializeTexture(gl, gl.TEXTURE3,'../images/player.png'),
    initializeTexture(gl, gl.TEXTURE4,'../images/player-normals.png'),
    initializeTexture(gl, gl.TEXTURE5,'../images/skeleton.png'),
    initializeTexture(gl, gl.TEXTURE6,'../images/sky.png')

    ])
    .then(function () {render();})
    //.catch(function (error) {alert('Failed to load texture '+  error.message);});
}
