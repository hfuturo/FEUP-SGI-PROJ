import * as THREE from 'three';

class MyLamp {

    constructor(app, position, intensity, material) {
        this.app = app;
        this.position = position;
        this.intensity = intensity;
        this.material = material;
    }

    display() {
        const lamp = this.#buildLamp();
        const light = this.#buildLight();

        const group = new THREE.Group();
        group.add(lamp);
        group.add(light);

        this.app.scene.add(group);
    }

    #buildLamp() {
        const lamp = new THREE.CylinderGeometry(1.2, 1.2, 0.13);
        const mesh = new THREE.Mesh(lamp, this.material);
        mesh.position.set(...this.position);

        return mesh;
    }

    #buildLight() {
        const light = new THREE.PointLight(0xFFFFFF, this.intensity, 0);
        light.position.set(this.position[0], this.position[1] - 0.1, this.position[2]);

        const helper = new THREE.PointLightHelper(light, 0.5);
        this.app.scene.add(helper);

        return light;
    }

}

export { MyLamp };