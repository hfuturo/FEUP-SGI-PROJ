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
        this.pulsating = fetch('./shaders/pulsating.vert').then(res => res.text());
        this.materials = [];

        this.#initCollisionObjects();
    }

    async display() {
        const loader = new FBXLoader();

        const pulsating = await this.pulsating;

        loader.load(
            "models/powerup/Present_low.fbx",
            (powerUp) => {
                powerUp.scale.set(0.02, 0.02, 0.02);
                powerUp.position.set(0, 0, 0);

                powerUp.traverse((child) => {
                    if (child.isMesh) {
                        child.material.forEach((mat, i) => {
                            mat.onBeforeCompile = (shader) => {
                                let vertexShader = shader.vertexShader;
                                const fragmentShader = shader.fragmentShader;

                                vertexShader = vertexShader.replace('void main() {', pulsating + '\nvoid main() {');
                                vertexShader = vertexShader.slice(0, - 1);
                                vertexShader += '\tpulsate();\n}\n';

                                shader.vertexShader = vertexShader;

                                child.material[i] = new THREE.ShaderMaterial({
                                    uniforms: {
                                        ...shader.uniforms,
                                        time: { value: 1.0 },
                                    },
                                    vertexShader,
                                    fragmentShader,
                                    lights: true
                                });
                                this.materials.push(child.material[i]);
                            };
                        });
                    }
                });
    
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
            new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: true, opacity: 0 })
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

    update(delta) {
        this.materials.forEach(material => {
            material.uniforms.time.value = (material.uniforms.time.value + delta*2) % (2*Math.PI);
        });
    }

}

export { MyPowerUp };