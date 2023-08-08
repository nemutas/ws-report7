struct Texture {
  sampler2D data;
  float aspect;
  bool flipY;
};

vec2 transformUv(vec2 _uv, float aspect, Texture texture) {
  vec2 uv = _uv;
  // flip
  if (texture.flipY == true) { uv = vec2(uv.x, 1.0 - uv.y); }
  // covered
  vec2 scale;
  if (aspect < texture.aspect) { scale = vec2(aspect / texture.aspect, 1.0); }
  else                         { scale = vec2(1.0, texture.aspect / aspect); }

  return (uv - 0.5) * scale + 0.5;
}