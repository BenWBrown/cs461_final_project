/*
 * Ben Brown
 * Dylan Quenneville
 * CS 461: Computer Graphics
 * Final Project: Platformer Game
 * shaders.js
 *  -> the vertex and fragment shaders used by WebGL
 */

let vertexShader = `
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;

uniform mat4 u_View;
uniform mat4 u_Projection;
uniform mat4 u_Transform;

varying vec3 v_Normal;
varying vec4 v_Color;
varying vec4 v_Position;
varying vec2 v_TexCoord;

void main(){
  v_Color = a_Color;
  v_Normal = a_Normal;
  v_TexCoord = a_TexCoord;
  v_Position = a_Position;
  gl_Position = u_Projection * u_View * u_Transform * a_Position;
}`;

let fragmentShader = `
precision highp float;

uniform mat4 u_Transform;
uniform mat4 u_View;
uniform vec3 u_Ambient;
uniform vec3 u_Diffuse;
uniform vec3 u_Specular;
uniform vec3 u_Shininess;
uniform vec3 u_LightDirection;
uniform vec4 u_LightPosition;

uniform sampler2D u_Sampler;
uniform sampler2D u_NormalMap;

uniform vec3 u_TransparentColor;

varying vec3 v_Normal;
varying vec4 v_Color;
varying vec4 v_Position;
varying vec2 v_TexCoord;

vec3 ambient, diffuse, specular;

vec3 light_position;
vec3 L, N, V, H, P;
float dist, alpha;


void main(){
  float max_angle = 0.2;
  vec3 light_ambient = u_Ambient;
  vec3 light_diffuse = u_Diffuse;
  vec3 light_specular = u_Specular;
  float shininess = 90.0;

  light_position = (u_View*u_LightPosition).xyz;//(u_View*vec4(5.0,5.0,3.0,1.0)).xyz;

  vec3 color = (texture2D(u_Sampler, v_TexCoord)).xyz;
  alpha = (texture2D(u_Sampler, v_TexCoord)).a;

  vec3 normal = (texture2D(u_NormalMap, v_TexCoord).xyz - vec3(0.5, 0.5, 0.5)) * 2.0;
  normal += v_Normal;

  normal = normalize(normal);


  P = (u_View*u_Transform*v_Position).xyz;

  dist = distance(P, light_position);
  N = normalize((u_View*u_Transform*vec4(normal, 0.0)).xyz);
  L = normalize(light_position - P);
  V = normalize( -P);
  H = normalize(L+V);

  ambient = color * light_ambient;
  diffuse = color * max(dot(L, N), 0.0) * light_diffuse;
  diffuse /= (1.0+0.005*dist*dist);
  specular = max(color * pow(max(dot(N, H), 0.0), shininess) * light_specular, 0.0) ;


  if (alpha < 0.5)
    discard;
  else
    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}
`;
