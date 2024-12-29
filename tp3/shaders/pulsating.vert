uniform float time;

void pulsate() {
    float scale = 1.0 + 0.05 * sin(time);

    vec3 scaledPosition = position * scale;

    vec4 modelViewPosition = modelViewMatrix * vec4(scaledPosition, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
}