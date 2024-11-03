import * as THREE from 'three';

class MyCandle {

    /**
     * Creates an instance of MyCandle.
     * 
     * @param {MyApp} app - The application context.
     * @param {number} radius - The radius of the candle.
     * @param {number} height - The height of the candle.
     * @param {Array<number>} position - The position of the candle in the format [x, y, z].
     */
    constructor(app, radius, height, position) {
        this.app = app;
        this.radius = radius;
        this.height = height;
        this.position = position;
    }

    display() {
        const candle = new THREE.CylinderGeometry(this.radius, this.radius, this.height);
        const texture = new THREE.TextureLoader().load('textures/candle.jpg');
        const material = new THREE.MeshLambertMaterial({
            map: texture
        });
        const mesh = new THREE.Mesh(candle, material);
        mesh.position.set(...this.position);
        this.app.scene.add(mesh);

        const flame = new THREE.ConeGeometry(this.radius - 0.01, 0.1);
        const flameTexture = new THREE.TextureLoader().load('textures/flame.jpg');
        flameTexture.wrapS = THREE.RepeatWrapping;
        flameTexture.wrapT = THREE.RepeatWrapping;
        const flameMaterial = new THREE.MeshLambertMaterial({
            map: flameTexture
        });
        const flameMesh = new THREE.Mesh(flame, flameMaterial);
        flameMesh.position.set(this.position[0], this.position[1] + 0.1, this.position[2]);
        this.app.scene.add(flameMesh);

        // Adds orange light to the flame
        const light = new THREE.PointLight(0xff6d2e, 5, 3);
        light.position.set(this.position[0], this.position[1] + 0.1, this.position[2]);
        this.app.scene.add(light);
    }

}

export { MyCandle };