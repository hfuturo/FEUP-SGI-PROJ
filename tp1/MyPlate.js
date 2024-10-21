import * as THREE from 'three';

class MyPlate {
    constructor(app, radius, height, position, material) {
        this.app = app;
        this.material = material;
        this.position = position;

        this.cylinder = new THREE.CylinderGeometry(radius, radius, height);
    }

    display() {
        const mesh = new THREE.Mesh(this.cylinder, this.material);
        mesh.position.set(...this.position);
        this.app.scene.add(mesh);
    }
}

export { MyPlate };