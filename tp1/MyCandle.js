import * as THREE from 'three';
import { MyFlame } from './MyFlame.js';

class MyCandle {

    constructor(app, radius, height, position) {
        this.app = app;
        this.radius = radius;
        this.height = height;
        this.position = position;

        const flamePosition = [this.position[0], this.position[1] + 0.1, this.position[2]];

        this.flame = new MyFlame(this.app, this.radius, 0.1, flamePosition);
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

        this.flame.display();
    }

}

export { MyCandle };