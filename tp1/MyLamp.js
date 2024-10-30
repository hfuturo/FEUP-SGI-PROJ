import * as THREE from 'three';

/**
 * Represents a lamp to be placed on the ceiling.
 */
class MyLamp {

    /**
     * Creates an instance of MyLamp.
     * 
     * @constructor
     * @param {MyApp} app - The application context.
     * @param {Array<number>} position - The position of the lamp [x,y,z].
     * @param {number} intensity - The intensity of the lamp's light.
     * @param {THREE.Material} material - The material of the lamp.
     */
    constructor(app, position, intensity, material) {
        this.app = app;
        this.position = position;
        this.intensity = intensity;
        this.material = material;

        this.endingMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            emissive: 0xFFFFFF
        });
    }

    display() {
        const lamp = this.#buildLamp();
        const light = this.#buildLight();

        const group = new THREE.Group();
        group.add(lamp);
        group.add(light);

        this.app.scene.add(group);
    }

    // Builds the lamp object.
    #buildLamp() {
        const lamp = new THREE.CylinderGeometry(1.2, 1.2, 0.13);
        const mesh = new THREE.Mesh(lamp, [this.material, this.material, this.endingMaterial]);
        mesh.position.set(...this.position);

        return mesh;
    }

    // Builds the lamp's light.
    #buildLight() {
        const light = new THREE.PointLight(0xFFFFFF, this.intensity, 0);
        light.position.set(this.position[0], this.position[1] - 0.1, this.position[2]);

        return light;
    }

}

export { MyLamp };