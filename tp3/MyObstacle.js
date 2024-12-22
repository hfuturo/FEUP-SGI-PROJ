import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class MyObstacle {

    constructor(app, pos) {
        this.app = app;
        this.pos = pos;

        // need to manually update sclae if radius is changed
        this.RADIUS = 2.4;
        this.sphere = new THREE.Mesh(
            this.sphere = new THREE.SphereGeometry(this.RADIUS),
            new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: true, opacity: 0 })
        );
        this.group = new THREE.Group();
    }

    display() {
        const loader = new FBXLoader();

        loader.load(
            "models/obstacle/spike.fbx",
            (obstacle) => this.#loadTextures(obstacle),
            (obj) => console.log(`${obj.loaded / obj.total * 100}% loaded`),
            (error) => console.error(`Error loading ballon object: ${error}`)
        );

        this.group.add(this.sphere);
        this.group.position.set(...this.pos);
        this.app.scene.add(this.group);
    }

    #loadTextures(obstacle) {
        const textureLoader = new THREE.TextureLoader();
        let spike;

        obstacle.traverse((child) => {
            if (child.isMesh) {
                spike = child;
                const textures = [
                    textureLoader.load("models/obstacle/Metal046A_2K-JPG_Color.jpg"),
                    textureLoader.load("models/obstacle/Metal046A_2K-JPG_Metalness.jpg"),
                    textureLoader.load("models/obstacle/Metal046A_2K-JPG_NormalGL.jpg"),
                    textureLoader.load("models/obstacle/Metal046A_2K-JPG_Roughness.jpg")
                ];

                if (Array.isArray(child.material)) {
                    child.material.forEach((mat, index) => {
                        mat.map = textures[index % textures.length];
                        mat.needsUpdate = true;
                    });
                }
                else {
                    child.material.map = textures[0];
                    child.material.needsUpdate = true;
                }
            }
        });
        
        // need to manually update sphere radius if scale is changed
        spike.scale.set(1.5, 1.5, 1.5);
        this.group.add(spike);
    }

    getPosition() {
        return this.pos;
    }

    getRadius() {
        return this.RADIUS;
    }

}

export { MyObstacle };