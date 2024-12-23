import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class MyPowerUp {

    constructor(app, pos) {
        this.app = app;
        this.pos = pos;
        this.width = 2;
        this.height = 2;
        this.depth = 2;

        this.group = new THREE.Group();

        this.#initCollisionObjects();
    }

    display() {
        const loader = new FBXLoader();

        loader.load(
            "models/powerup/Present_low.fbx",
            (powerUp) => {
                powerUp.scale.set(0.02, 0.02, 0.02);
                powerUp.position.set(0, 0, 0);
                this.group.add(powerUp);
            },
            (obj) => console.log(`${obj.loaded / obj.total * 100}% loaded`),
            (error) => console.error(`Error loading powerup object: ${error}`)
        );

        this.group.position.set(...this.pos);
        this.app.scene.add(this.group);
    }

    #initCollisionObjects() {
        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth),
            new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: true, opacity: 1 })
        );

        this.box.position.set(0, 1, 0);
        this.group.add(this.box);
    }

    getPosition() {
        const v = new THREE.Vector3();
        this.box.getWorldPosition(v);
        return this.pos;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    getDepth() {
        return this.depth;
    }

}

export { MyPowerUp };