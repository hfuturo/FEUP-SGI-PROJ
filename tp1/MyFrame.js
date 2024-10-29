import * as THREE from 'three';
import { MyLight } from './MyLight.js';

class MyFrame {

    constructor(app, width, height, depth, position, rotation, materialOut, materialIn, buildSpotLight=true) {
        this.app = app;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.position = position;
        this.rotation = rotation;
        this.materialOut = materialOut;
        this.materialIn = materialIn;
        this.buildSpotLight = buildSpotLight;

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

        horizontalPieceMesh1.position.set(this.position[0], this.position[1] + this.depth/2 + this.height/2, this.position[2]);
        verticalPieceMesh1.position.set(this.position[0] + this.width / 2, this.position[1], this.position[2]);

        const horizontalPieceMesh2 = horizontalPieceMesh1.clone();
        horizontalPieceMesh2.position.y -= this.height + this.depth;


        const verticalPieceMesh2 = verticalPieceMesh1.clone();
        verticalPieceMesh2.position.x -= this.width;

        const insideMesh = new THREE.Mesh(this.inside, this.materialIn);
        insideMesh.position.set(this.position[0], this.position[1], this.position[2]);

        const group = new THREE.Group();
        group.add(horizontalPieceMesh1);
        group.add(horizontalPieceMesh2);
        group.add(verticalPieceMesh1);
        group.add(verticalPieceMesh2);
        group.add(insideMesh);

        group.rotation.set(...this.rotation);


        if (this.buildSpotLight) {
            this.app.scene.add(this.spotLight.display());
        }

        this.app.scene.add(group);
    }
}

export { MyFrame };