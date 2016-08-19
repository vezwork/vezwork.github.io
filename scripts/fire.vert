attribute vec3 pos;
attribute vec3 tex;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec3 texOut;

void main(void) {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1);
  texOut = tex;
}
