import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class MyObstacle {

    /**
     * Creates an instance of MyObstacle.
     * 
     * @constructor
     * @param {Object} app - The application instance.
     * @param {Array<number>} pos - The position of the obstacke.
     * @param {THREE.Object3D} simpleRepresentation - A simple representation of the obstacle.
     */
    constructor(app, pos, simpleRepresentation) {
        this.app = app;
        this.pos = pos;

        this.representation = new THREE.LOD();
        this.representation.position.set(...this.pos);

        this.group = new THREE.Group();
        this.representation.addLevel(this.group, 0);
        this.representation.addLevel(simpleRepresentation, 100);

        this.materials = [];

        this.pulsating = fetch('./shaders/pulsating.vert').then(res => res.text());

        this.#initCollisionObjects();
    }
    
    /**
     * Initializes the collision objects for the obstacle.
     * Creates a transparent sphere to represent the obstacle's collision area.
     */
    #initCollisionObjects() {
        // need to manually update sclae if radius is changed
        this.RADIUS = 2.4;
        this.sphere = new THREE.Mesh(
            this.sphere = new THREE.SphereGeometry(this.RADIUS),
            new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: true, opacity: 0 })
        );
    }

    /**
     * Initializes the complex representation of the obstacle using a FBX model.
     * A Shader Material is applied to the model to make it pulsate.
     * A modification is made to the original vertex shader to include the pulsating effect, and the fragment shader 
     * and the maps are left unchanged to keep the original appearance. 
     */
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
        this.app.scene.add(this.representation);
    }

    getPosition() {
        return this.pos;
    }

    getRadius() {
        return this.RADIUS;
    }

    /**
     * Updates the time uniform of each material by incrementing it with the given delta value.
     * The time value is wrapped around using the modulus operator to keep it within the range of 0 to 2*PI.
     *
     * @param {number} delta - The time delta to increment the time uniform by.
     */
    update(delta) {
        this.materials.forEach(material => {
            material.uniforms.time.value = (material.uniforms.time.value + delta*2) % (2*Math.PI);
        });
    }

}

export { MyObstacle };