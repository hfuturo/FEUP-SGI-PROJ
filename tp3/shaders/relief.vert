#include <packing>

varying vec2 vTexCoord;

uniform sampler2D uDepthTex;
uniform float cameraNear;
uniform float cameraFar;
uniform float depthScale;

float readDepth() {
    float fragCoordZ = texture2D(uDepthTex, uv).x;
    float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
    return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
}

void main() {
    float depth = (1.0 - readDepth()) * depthScale;

    vec3 displacedPosition = position + normal * depth;

    vTexCoord = uv;

    vec4 modelViewPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}