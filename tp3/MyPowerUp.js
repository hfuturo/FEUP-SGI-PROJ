import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

class MyPowerUp {

    /**
     * Creates an instance of MyPowerUp.
     * 
     * @constructor
     * @param {Object} app - The application instance.
     * @param {Array<number>} pos - The position of the power-up.
     * @param {THREE.Object3D} simpleRepresentation - A simple representation of the power-up.
     */
    constructor(app, pos, simpleRepresentation) {
        this.app = app;
        this.pos = pos;
        this.width = 2;
        this.height = 2;
        this.depth = 2;

        this.representation = new THREE.LOD();
        this.representation.position.set(...this.pos);

        this.group = new THREE.Group();
        this.representation.addLevel(this.group, 0);
        this.representation.addLevel(simpleRepresentation, 100);

        this.pulsating = fetch('./shaders/pulsating.vert').then(res => res.text());
        this.materials = [];

        this.#initCollisionObjects();
    }

    /**
     * Initializes the complex representation of the power-up using a FBX model.
     * A Shader Material is applied to the model to make it pulsate.
     * A modification is made to the original vertex shader to include the pulsating effect, and the fragment shader is left unchanged to keep the original appearance. 
     */
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

        this.app.scene.add(this.representation);
    }

    /**
     * Initializes the collision objects for the power-up.
     * Creates a transparent box mesh with the specified dimensions and adds it to the group.
     */
    #initCollisionObjects() {
        this.box = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth),
            new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: true, opacity: 0 })
        );

        this.box.position.set(0, 1, 0);
        this.group.add(this.box);
    }

    getPosition() {
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

export { MyPowerUp };