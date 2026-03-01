export const atmosphereVertexShader = `
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}`;

export const atmosphereFragmentShader = `
uniform vec3 uColor;
uniform float uIntensity;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  float fresnel = pow(1.0 - dot(vViewDir, vNormal), 5.0);
  gl_FragColor = vec4(uColor, fresnel * uIntensity);
}`;
