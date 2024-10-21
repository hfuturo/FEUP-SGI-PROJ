import * as THREE from "three";

class MyLandscape {

    constructor(app, width, height, position) {
        this.app = app;
        this.width = width;
        this.height = height;
        this.position = position;
    }

    display() {
        const landscape = new THREE.PlaneGeometry(this.width, this.height);
        const texture = new THREE.TextureLoader().load('textures/landscape.webp');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const material = new THREE.MeshLambertMaterial({
            map:texture
        });
        const mesh = new THREE.Mesh(landscape, material);
        mesh.position.set(...this.position);
        this.app.scene.add(mesh);

        this.#displayLight();
    }

    #displayLight() {
        const light = new THREE.DirectionalLight(0xFFFFFF, 2, 0);
        light.position.set(...this.position);
        light.target.position.set(0, 5, -5);
        this.app.scene.add(light);
        // const lightHelper = new THREE.DirectionalLightHelper(light, 0.5);
        // this.app.scene.add(lightHelper);
    }
}

export { MyLandscape };