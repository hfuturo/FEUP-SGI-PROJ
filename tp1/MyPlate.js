import * as THREE from 'three';

class MyPlate {
    /**
     * Creates an instance of MyPlate.
     * 
     * @constructor
     * @param {MyApp} app - The application context.
     * @param {number} radius - The radius of the cylinder.
     * @param {number} height - The height of the cylinder.
     * @param {Array<number>} position - The position of the cylinder, [x,y,z].
     * @param {THREE.Material} material - The material of the cylinder.
     */
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