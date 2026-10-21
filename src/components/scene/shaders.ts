export const vortexVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const vortexFragment = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float spiral = sin(a * 5.0 - r * 14.0 + uTime * (1.1 + uIntensity * 1.8));
  float core = smoothstep(0.95, 0.05, r);
  float bands = smoothstep(0.15, 0.85, spiral * 0.5 + 0.5) * core;
  float deep = smoothstep(1.1, 0.2, r);
  vec3 navy = vec3(0.03, 0.06, 0.14);
  vec3 gold = vec3(0.78, 0.58, 0.28);
  vec3 ice = vec3(0.42, 0.62, 0.82);
  vec3 col = mix(navy, ice, bands * 0.45);
  col = mix(col, gold, bands * bands * (0.35 + uIntensity * 0.35));
  col += gold * pow(core, 6.0) * (0.25 + uIntensity * 0.4);
  float alpha = deep * (0.72 + uIntensity * 0.18);
  gl_FragColor = vec4(col, alpha);
}
`

export const flowVertex = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
attribute float aOffset;
varying float vFade;
void main() {
  vec3 p = position;
  float t = uTime * uSpeed + aOffset;
  p *= 1.0 + 0.02 * sin(t * 3.0);
  vFade = smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.7, uv.x);
  // uv not available on tube without modification - use position.x as fade proxy via aOffset
  vFade = 0.35 + 0.65 * (0.5 + 0.5 * sin(t));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

export const flowFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying float vFade;
void main() {
  float a = (0.22 + uIntensity * 0.28) * vFade;
  vec3 col = uColor * (0.75 + uIntensity * 0.45);
  gl_FragColor = vec4(col, a);
}
`
