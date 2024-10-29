import * as THREE from 'three';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

class MyCarpet {
    constructor(app, length, width, position, rotationY=0) {
        this.app = app;
        this.position = position;
        this.rotationY = rotationY;

        const points = [
            [
                [-length/2 + 0.5, 0, -width/2, 1],
                [-length/2, 0, -width/4, 1],
                [-length/2, 0, width/4, 1],
                [-length/2, 0, width/2, 1]
            ],
            [
                [-length/2 + 1, 0.8, -width/2, 1],
                [-length/2 + 1, 0, -width/4, 1],
                [-length/2 + 1, 0, width/4, 1],
                [-length/2 + 1, 0, width/2, 1]
            ],
            [
                [-length/2 + 2, 0, -width/2, 2],
                [-length/2 + 2, 0, -width/4, 1],
                [-length/2 + 2, 0, width/4, 1],
                [-length/2 + 2, 0, width/2, 1]
            ]
        ];

        for (let i = -length/2 + 3; i < length/2; i++) {
            points.push([
                [i, 0, -width/2, 1],
                [i, 0, -width/4, 1],
                [i, 0, width/4, 1],
                [i, 0, width/2, 1]
            ]);
        }

        const nurbsBuilder = new MyNurbsBuilder(app);
        this.surface = nurbsBuilder.build(points, points.length - 1, 3);

        const texture = new THREE.TextureLoader().load('textures/carpet.png');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.material = new THREE.MeshLambertMaterial({map: texture});
        this.material.side = THREE.DoubleSide;
    }

    display() {
        const mesh = new THREE.Mesh(this.surface, this.material);
        mesh.position.set(...this.position);
        mesh.rotation.y = this.rotationY;
        mesh.receiveShadow = true;
        this.app.scene.add(mesh);
        
    }
}

export { MyCarpet };