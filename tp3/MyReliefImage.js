import * as THREE from 'three'

class MyReliefImage {
    constructor(app) {
        this.app = app

        this.vertexShader = fetch('./shaders/relief.vert').then(res => res.text())
        this.fragmentShader = fetch('./shaders/relief.frag').then(res => res.text())
    }

    async getImage(gray, color) {
        const [vertexShader, fragmentShader] = await Promise.all([this.vertexShader, this.fragmentShader]);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uGrayTex: { type: 'sampler2D', value: gray },
                uColorTex: { type: 'sampler2D', value: color },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });

        const plane = new THREE.PlaneGeometry(32, 16, 320, 160);
        const mesh = new THREE.Mesh(plane, this.material);

        return mesh;
    }

}

export { MyReliefImage }