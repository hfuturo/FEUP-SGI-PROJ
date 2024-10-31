import * as THREE from 'three';
import { MyLight } from './MyLight.js';

class MyFrame {

    /**
     * Creates an instance of MyFrame.
     * 
     * @param {MyApp} app - The application context.
     * @param {number} width - The width of the frame.
     * @param {number} height - The height of the frame.
     * @param {number} depth - The depth of the frame.
     * @param {Array<number>} position - The position of the frame.
     * @param {Array<number>} rotation - The rotation of the frame.
     * @param {THREE.Material} materialOut - The material of the frame.
     * @param {THREE.Material} materialIn - The material inside the fraim, e.g. painting, window, etc.
     * @param {boolean} [receiveShadow=false] - Whether the frame receives shadows.
     * @param {boolean} [buildSpotLight=true] - Whether to build a spotlight for the frame.
     */
    constructor(app, width, height, depth, position, rotation, materialOut, materialIn, receiveShadow=false, buildSpotLight=true) {
        this.app = app;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.position = position;
        this.rotation = rotation;
        this.materialOut = materialOut;
        this.materialIn = materialIn;
        this.buildSpotLight = buildSpotLight;
        this.receiveShadow = receiveShadow;

        // Also store rotation in degrees to be used in the GUI
        this.materialIn.map.rotationD = this.materialIn.map.rotation * 180 / Math.PI;

        this.horizontalPiece = new THREE.BoxGeometry(this.width - this.depth, this.depth, this.depth);
        this.verticalPiece = new THREE.BoxGeometry(this.depth, this.height + 2*this.depth, this.depth);
        this.inside = new THREE.PlaneGeometry(this.width, this.height);

        if (this.buildSpotLight) {
            this.spotLight = new MyLight(this.app, this.position, 2, 0, Math.PI / 7, 1, 0, false, true);
        }
    }

    display() {
        const horizontalPieceMesh1 = new THREE.Mesh(this.horizontalPiece, this.materialOut);
        const verticalPieceMesh1 = new THREE.Mesh(this.verticalPiece, this.materialOut);
        horizontalPieceMesh1.receiveShadow = this.receiveShadow;
        verticalPieceMesh1.receiveShadow = this.receiveShadow;

        horizontalPieceMesh1.position.set(this.position[0], this.position[1] + this.depth/2 + this.height/2, this.position[2]);
        verticalPieceMesh1.position.set(this.position[0] + this.width / 2, this.position[1], this.position[2]);

        const horizontalPieceMesh2 = horizontalPieceMesh1.clone();
        horizontalPieceMesh2.position.y -= this.height + this.depth;


        const verticalPieceMesh2 = verticalPieceMesh1.clone();
        verticalPieceMesh2.position.x -= this.width;

        const insideMesh = new THREE.Mesh(this.inside, this.materialIn);
        insideMesh.position.set(this.position[0], this.position[1], this.position[2]);
        insideMesh.receiveShadow = this.receiveShadow;
        
        this.group = new THREE.Group();
        this.group.add(horizontalPieceMesh1);
        this.group.add(horizontalPieceMesh2);
        this.group.add(verticalPieceMesh1);
        this.group.add(verticalPieceMesh2);
        this.group.add(insideMesh);

        this.group.rotation.set(...this.rotation);


        if (this.buildSpotLight) {
            this.app.scene.add(this.spotLight.display());
        }

        this.app.scene.add(this.group);
    }
}

export { MyFrame };