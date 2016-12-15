// create 2D array of dimensions (size x size) and fill each element with 0
var blankField = function(size) {
  let field = new Array(size);
  for (let i = 0; i < size; i++) {
    field[i] = new Array(size);
    for (let j = 0; j < size; j++) {
      field[i][j] = 0;
    }
  }
  return field;
}


// this creates the heightfield of 2^n + 1 dimensions
// field is form heightField[x][z]
var buildHeightfield = function(n, roughness, tame = false){
  // initialize 2D array of dimensions (2^n + 1 x 2^n + 1)
  if (n < 1) {
    return [];
  }
  if (!roughness) {
    roughness = 0.3;
  }
  let size = Math.pow(2, n); // size of square(s)
  let s = size;
  let field = blankField(size+1);
  let a, b, c, d, avg;
  // current square corners:
  // c  d
  // a  b
  field[0][0] = 0.0;
  field[size][0] = 0.0;
  field[0][size] = 0.0;
  field[size][size] = 0.0;
  for (let i = 0; i < n; i++) { // will need to perfom n times
    if (roughness < 0.0) {
      r = -roughness;
    } else {
      r = roughness * s;
    }
    s2 = s/2 // purely for clarity's sake
    sizeInv = Math.pow(2, i);
    // square step
    let sx = 0;
    let sz = 0;
    while (sz < size) { // less than TOTAL size
      sx = 0;
      while (sx < size) {
        a = field[sx][sz];
        b = field[sx+s][sz];
        c = field[sx][sz+s];
        d = field[sx+s][sz+s];
        avg = (a+b+c+d)/4.0;
        // console.log("updating", sx, sz, "to", sx+s, sz+s, "avg is", avg);
        field[sx+s2][sz+s2] = avg + Math.random()*2.0*r - r;
        sx += s;
      }
      sz += s;
    }
    // diamond step
    //   c
    // d   b
    //   a
    sx = s2;
    sz = 0;
    while (sz <= size) { // less than TOTAL size
      while (sx <= size) {
        point_ct = 0;
        if (sz-s2 >= 0) { // has top corner
          a = field[sx][sz-s2];
          point_ct++;
        } else {
          a = 0;
        }
        if (sx+s2 <= size) { // has bottom corner
          b = field[sx+s2][sz];
          point_ct++;
        } else {
          b = 0;
        }
        if (sz+s2 <= size) { // has top corner
          c = field[sx][sz+s2];
          point_ct++;
        } else {
          c = 0;
        }
        if (sx-s2 >= 0) { // has top corner
          d = field[sx-s2][sz];
          point_ct++;
        } else {
          d = 0;
        }
        avg = (a+b+c+d)/point_ct;
        // console.log("updating diamond", sx-s2, sz-s2, "to", sx+s2, sz+s2, "avg is", avg);
        field[sx][sz] = avg + Math.random()*2.0*r - r;
        // if (sx == 0 || sz == 0 || sx == size || sz == size)
        //   field[sx][sz] = 0;
        sx += s;
      }
      sz += s2;
      sx = (sx % s == 0 ? s2 : 0);
    }
    s /= 2;
  }
  console.log(field);
  return field;
}

var cliffEdges = function(field) {
  let width = field.length;
  let depth = field[0].length;
  for (let i = 0; i < (width); i++) {
    field[i][0] -= Math.random()+2;
    field[i][depth-2] -= Math.random()+2;
    field[i][1] -= Math.random();
    field[i][depth-3] -= Math.random();
  }
  for (let j = 0; j < (depth); j++) {
    field[0][j] -= Math.random()+2;
    field[width-2][j] -= Math.random()+2;
    field[1][j] -= Math.random();
    field[width-3][j] -= Math.random();
  }
}

// fill in triangle tile normals array of size (2*(n-1) x n-1)
var getTriangleNormals = function(field) {
  let width = field.length;
  let depth = field[0].length;
  let normals = new Array((width-1)*2);
  for (let i = 0; i < (width-1); i++) {
    k = i*2;
    normals[k] = new Array(depth-1);
    normals[k+1] = new Array(depth-1);
    for (let j = 0; j < depth-1; j++) {
      vector1 = vec3.create();
      vector2 = vec3.create();
      vector3 = vec3.create();
      // first triangle (top left)
      vector1 = vec3.fromValues(1, field[i+1][j]-field[i][j], 0);
      vector2 = vec3.fromValues(0, field[i][j+1]-field[i][j], 1);
      vec3.cross(vector3, vector1, vector2);
      vec3.normalize(vector3, vector3);
      normals[k][j] = vector3;

      // second triangle (bottom right)
      vector1 = vec3.fromValues(-1, field[i][j+1]-field[i+1][j+1], 0);
      vector2 = vec3.fromValues(0, field[i+1][j]-field[i+1][j+1], -1);
      vec3.cross(vector3, vector2, vector1);
      vec3.normalize(vector3, vector3);
      normals[k+1][j] = vector3;
    }
  }
  return normals;
}

// fill in triangle normals array of size (2*(n-1) x n-1)
var getAverageNormals = function(triangleNormals) {
  let width = triangleNormals.length/2+1;
  let depth = triangleNormals[0].length+1;
  let normals = new Array(width);
  for (let i = 0; i < width-1; i++) {
    normals[i] = new Array(depth);
    for (let j = 0; j < depth; j++) {
      // console.log(i, j,":",triangleNormals[i*2][j]);
      normals[i][j] = vec3.create();
      if (i == 0 || j == 0 || i == width-1 || j == depth-1)
        normals[i][j] = vec3.fromValues(0,0,0);
      else {
        for (var band = 0; band < 3; band++) {
          // console.log(triangleNormals[i*2][j])
          normals[i][j][band] = ( (
            triangleNormals[i*2][j][band] +
            triangleNormals[i*2-1][j][band] +
            triangleNormals[i*2+1][j][band] +
            triangleNormals[i*2-2][j-1][band] +
            triangleNormals[i*2-1][j-1][band] +
            triangleNormals[i*2][j-1][band]
          ))/6;
        }
        // console.log(normals[i][j]);
      }

      vec3.normalize(normals[i][j], normals[i][j]);
    }
  }
  // console.log("normals (final):", normals);
  return normals;
}



var createPlatform = function(game, textureID, size, yOffset, xOffset, scale, roughness) {
  let map = buildHeightfield(size, (roughness ? roughness : -0.1));
  cliffEdges(map);
  let triangleNormals = getTriangleNormals(map);
  var normals = getAverageNormals(triangleNormals);
  let platform = {
    textureID: textureID,
    size: size,
    yOffset: yOffset,
    xOffset: xOffset,
    scale: scale,
    heights: map,
    normals: getAverageNormals(triangleNormals),
    diffuse: [0.9, 0.9, 0.9],
    specular: [0.8, 0.8, 0.8],
    shininess: 100.0,
    heightAt: (xCoord, yCoord) => { //TODO: MAKE SURE THIS ACTUALLY WORKS. also, maybe interpolate in Y
      let y = Math.floor(yCoord);
      let x = xCoord;
      if (xCoord < 0) {
        let offset = Math.floor(1-Math.floor(xCoord) / map.length) * map.length;
        x += offset; //I think this works but haven't tested it yet
      }
      let left = Math.floor(x) % map.length;
      let right = Math.ceil(x) % map.length;
      let weight = 1 - (x - left);
      return map[left][y] * weight + map[right][y] * (1 - weight) + yOffset;
    }
  }
  game.addPlatform(platform);
  return platform;
}

var createWater = function(game, textureID, size, yOffset, xOffset, scale, roughness) {
  let map = buildHeightfield(size, (roughness ? roughness : -0.05));
  let triangleNormals = getTriangleNormals(map);
  var normals = getAverageNormals(triangleNormals);
  return {
    textureID: textureID,
    yOffset: yOffset,
    xOffset: xOffset,
    scale: scale,
    heights: map,
    normals: getAverageNormals(triangleNormals),
    color: [0.0, 0.2, 0.5],
    diffuse: [0.9, 0.9, 0.9],
    specular: [0.8, 0.8, 0.8],
    shininess: 100.0
  }
}
