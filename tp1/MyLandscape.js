import * as THREE from "three";

class MyLandscape {

    /**
     * Creates an instance of MyLandscape.
     * 
     * @constructor
     * @param {MyApp} app - The application instance.
     * @param {number} width - The width of the landscape.
     * @param {number} height - The height of the landscape.
     * @param {Array<number>} position - The position of the landscape [x, y, z].
     * @param {Array<number>} [rotation=[0,0,0]] - The rotation of the landscape, default is [0, 0, 0].
     */
    constructor(app, width, height, position, rotation=[0,0,0]) {
        this.app = app;
        this.width = width;
        this.height = height;
        this.position = position;
        this.rotation = rotation;
    }

    display() {
        const landscape = new THREE.PlaneGeometry(this.width, this.height);
        const texture = new THREE.TextureLoader().load('textures/landscape.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const material = new THREE.MeshLambertMaterial({
            map:texture
        });
        const mesh = new THREE.Mesh(landscape, material);
        mesh.position.set(...this.position);
        mesh.rotation.set(...this.rotation);
        this.app.scene.add(mesh);

        this.#displayLight();
    }


    /**
     * Sets up and displays a directional light in the scene, to emulate light coming from the outside.
     */
    #displayLight() {
        const light = new THREE.DirectionalLight(0xFFFFFF, 2, 0);
        light.position.set(...this.position);
        light.rotation.set(...this.rotation);
        light.target.position.set(0, 0, 17);
        light.target.updateMatrixWorld();
        light.castShadow = true;
        light.shadow.camera.right = -15;
        light.shadow.camera.left = 15;
        light.shadow.camera.top = 25;
        light.shadow.camera.far = 30;
        this.app.scene.add(light);

        // const shadowHelper = new THREE.CameraHelper(light.shadow.camera);
        // this.app.scene.add(shadowHelper);
    }
}

export { MyLandscape };