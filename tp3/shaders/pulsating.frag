varying vec2 vTexCoord;

uniform vec3 uColor;
uniform sampler2D uTexture;

void main() {
    vec4 texColor = texture2D(uTexture, vTexCoord);
    if (texColor.a == 0.0) {
        gl_FragColor = vec4(uColor, 1.0);
    } else {
        gl_FragColor = 0.6*texColor + 0.4*vec4(uColor, 1.0);
    }
}
