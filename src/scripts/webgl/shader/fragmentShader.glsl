precision highp float;

uniform sampler2D uTexture;
uniform float uAspect;
uniform float uImageAspect;
varying vec2 vUv;

vec2 coveredUv(){
  vec2 scale;
  if (uAspect < uImageAspect) { scale = vec2(uAspect / uImageAspect, 1.0); }
  else                        { scale = vec2(1.0, uImageAspect / uAspect); }
  return (vUv - 0.5) * scale + 0.5;
}

void main() {
  vec4 tex = texture2D(uTexture, coveredUv());
  gl_FragColor = tex;
}