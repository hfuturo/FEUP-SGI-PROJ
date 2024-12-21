varying vec2 vTexCoord;

uniform sampler2D uColorTex;

void main() {
    vec4 color = texture2D(uColorTex, vTexCoord);
    
    gl_FragColor = color;
}
