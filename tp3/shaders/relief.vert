varying vec2 vTexCoord;

uniform sampler2D uGrayTex;

void main() {
    float relief = texture2D(uGrayTex, uv).r;

    vec3 displacedPosition = position + normal * relief;

    vTexCoord = uv;

    vec4 modelViewPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}
