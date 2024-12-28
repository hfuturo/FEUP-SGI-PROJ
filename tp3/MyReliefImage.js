import * as THREE from 'three'

class MyReliefImage {
    constructor(app) {
        this.app = app
        this.scale = 5;
        this.horizontalDivisions = 320;
        this.verticalDivisions = 160;

        this.vertexShader = fetch('./shaders/relief.vert').then(res => res.text())
        this.fragmentShader = fetch('./shaders/relief.frag').then(res => res.text())
    }

    async getImage(depth, color) {
        const [vertexShader, fragmentShader] = await Promise.all([this.vertexShader, this.fragmentShader]);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uDepthTex: { type: 'sampler2D', value: depth },
                cameraNear: { value: this.app.activeCamera.near },
                cameraFar: { value: this.app.activeCamera.far },
                depthScale: { value: this.scale },
                uColorTex: { type: 'sampler2D', value: color },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        });

        const plane = new THREE.PlaneGeometry(32, 16, this.horizontalDivisions, this.verticalDivisions);
        const mesh = new THREE.Mesh(plane, this.material);
        return mesh;
    }

}

export { MyReliefImage }