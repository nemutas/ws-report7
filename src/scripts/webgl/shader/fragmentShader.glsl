precision highp float;

struct Texture {
  sampler2D data;
  float aspect;
};

uniform Texture uTextures[2];
uniform float uAspect;
varying vec2 vUv;

vec2 coveredUv(Texture texture){
  vec2 scale;
  if (uAspect < texture.aspect) { scale = vec2(uAspect / texture.aspect, 1.0); }
  else                          { scale = vec2(1.0, texture.aspect / uAspect); }
  return (vUv - 0.5) * scale + 0.5;
}

void main() {
  vec4 tex1 = texture2D(uTextures[0].data, coveredUv(uTextures[0]));
  vec4 tex2 = texture2D(uTextures[1].data, coveredUv(uTextures[1]));
  vec4 final = mix(tex1, tex2, step(0.5, vUv.x));
  gl_FragColor = final;
}