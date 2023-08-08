precision highp float;

#define PI 3.141592653589793

#include '../glsl/texture.glsl'

uniform Texture uTextures[2];
uniform float uAspect;
uniform vec2 uMouseMove;
uniform vec2 uMouseDrag;
uniform float uScroll;
uniform float uTime;
uniform float uProgress;
varying vec2 vUv;

#include '../glsl/math.glsl'
#include '../glsl/matcap.glsl'
#include '../raymarching/primitives.glsl'
#include '../raymarching/combinations.glsl'

float invAspect = max(1.0, 1.0 / uAspect);

vec3 onRep(vec3 p, float interval) {
  vec3 q = mod(p + 0.5 * interval, interval) - 0.5 * interval;
  return q;
}

float sdf(vec3 _p) {
  vec3 p = _p;
  float angle = -PI / 9.0;
  p.xy = rotate(_p.xy, angle);

  vec3 move = vec3(-1.0, 1.0, 0.0) * vec3(uMouseDrag + vec2(0.0, uScroll), 0.0) * 0.0006;
  move.xy = rotate(move.xy, angle);

  vec3 q = onRep((p * 0.2 + move) * invAspect, 0.25);
  q.z = p.z;

  float scale = sin((p.y + q.y) * PI - uTime * 4.0) * 0.5 + 0.5;
  scale = scale * (1.0 - 0.4) + 0.4;
  scale = 1.0;

  float final = sdBox(q, vec3(0.1, 0.1, 0.01) * vec3(scale, 1.0, 1.0)) - 0.018;
  return final;
}

#include '../raymarching/normal.glsl'

void main() {
  vec2 p = (vUv * 2.0 - 1.0) * vec2(uAspect, 1.0);
  
  vec3 cPos  = vec3(0.0, 0.0, 2.0);
  vec3 cDir  = normalize(vec3(0.0, 0.0, -1.0));
  vec3 cUp   = vec3(0.0,  1.0,  0.0);
  vec3 cSide = cross(cDir, cUp);
  float targetDepth = 1.5;
  vec3 ray = normalize( cSide * p.x + cUp * p.y + cDir * targetDepth );

  vec3 rayPos = cPos;
  float totalDist = 0.0;
  float totalMax = cPos.z + 4.0;

  for (int i = 0; i < 64; i++) {
    float dist = sdf(rayPos);
    if (abs(dist) < 0.002 || totalMax < totalDist) break;
    totalDist += dist;
    rayPos = cPos + totalDist * ray;
  }

  vec3 color = vec3(0.0);

  if (totalDist < totalMax) {
    vec3 normal = calcNormal(rayPos);

    vec3 light = vec3(uMouseMove * vec2(uAspect, 1.0), 1.0);
    vec3 lightVec = normalize(light);

    // 反射光
    vec3 refl = reflect(ray, normal);
    float l = dot(refl, lightVec);
    float speculer = smoothstep(0.0, 1.0, l);
    float frontFace = smoothstep(1.0, 0.96, normal.z);
    speculer *= frontFace;
    speculer = pow(speculer, 50.0);
    speculer *= smoothstep(4.0, 2.0, distance(light, rayPos)) * (1.0 - 0.1) + 0.1;

    vec2 distortion = -normal.xy * 0.03 * frontFace;
    vec2 uv = transformUv(vUv, uAspect, uTextures[0]);
    uv = (uv - 0.5) * min((1.0 / uAspect) * 2.3, 2.0) + 0.5;
    vec4 tex1 = texture2D(uTextures[0].data, uv + distortion);

    vec2 mUv = matcap(ray, normal + vec3(uMouseMove * 0.1, 0.0));
    mUv = 1.0 - mUv;
    vec4 tex2 = texture2D(uTextures[1].data, mUv + rand(ray.xy) * 0.03);
    color = mix(vec3(0.025), pow(tex2.rgb + 0.5, vec3(10.0)), tex1.r);

    color += speculer;
  }

  gl_FragColor = vec4(color, 1.0);
}