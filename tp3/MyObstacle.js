import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class MyObstacle {

    constructor(app, pos) {
        this.app = app;
        this.pos = pos;

        this.group = new THREE.Group();
        this.materials = [];

        this.pulsating = fetch('./shaders/pulsating.vert').then(res => res.text());

        this.#initCollisionObjects();
    }
    
    #initCollisionObjects() {
        // need to manually update sclae if radius is changed
        this.RADIUS = 2.4;
        this.sphere = new THREE.Mesh(
            this.sphere = new THREE.SphereGeometry(this.RADIUS),
            new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: true, opacity: 0 })
        );
    }

    async display() {
        const loader = new FBXLoader();

        const pulsating = await this.pulsating;

        loader.load(
            "models/obstacle/spike.fbx",
            (obstacle) => {
                const spike = obstacle.children[1];

                spike.traverse((child) => {
                    if (child.isMesh) {
                        const originalMaterial = child.material;

                        child.material.onBeforeCompile = (shader) => {
                            let vertexShader = shader.vertexShader;
                            const fragmentShader = shader.fragmentShader;

                            vertexShader = vertexShader.replace('void main() {', pulsating + '\nvoid main() {');
                            vertexShader = vertexShader.slice(0, - 1);
                            vertexShader += '\tpulsate();\n}\n';

                            shader.vertexShader = vertexShader;

                            child.material = new THREE.ShaderMaterial({
                                uniforms: {
                                    ...shader.uniforms,
                                    time: { value: 1.0 },
                                },
                                vertexShader,
                                fragmentShader,
                                lights: true
                            });
                            child.material.map = originalMaterial.map;
                            child.material.normalMap = originalMaterial.normalMap;

                            this.materials.push(child.material);
                        };
                    }
                });
                
                // need to manually update sphere radius if scale is changed
                spike.scale.set(1.5, 1.5, 1.5);
                this.group.add(spike);
            },
            (obj) => console.log(`${obj.loaded / obj.total * 100}% loaded`),
            (error) => console.error(`Error loading ballon object: ${error}`)
        );

        this.group.add(this.sphere);
        this.group.position.set(...this.pos);
        this.app.scene.add(this.group);
    }

    getPosition() {
        return this.pos;
    }

    getRadius() {
        return this.RADIUS;
    }

    update(delta) {
        this.materials.forEach(material => {
            material.uniforms.time.value = (material.uniforms.time.value + delta*2) % (2*Math.PI);
        });
    }

}

export { MyObstacle };