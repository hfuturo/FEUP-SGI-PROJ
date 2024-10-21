import * as THREE from 'three';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

class MyNewspaper {
    constructor(app, position, rotation=[0, 0, 0], scale=[1, 1, 1]) {
        this.app = app;
        this.nurbsBuilder = new MyNurbsBuilder();
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;

        const controlPoints = [// U = 0
            [// V = 0..2
                [0, 0, 0, 1],
                [0.5, 0.5, 0, 1],
                [1, 0, 0, 1]
            ],
            // U = 1
            [// V = 0..2
                [0, 0, 1.4, 1],
                [0.5, 0.5, 1.4, 1],
                [1, 0, 1.4, 1]
            ],
        ]

        this.surface = this.nurbsBuilder.build(controlPoints, 1, 2, 8, 8);

        const texture = new THREE.TextureLoader().load('textures/newspaper.jpg');
        texture.rotation = Math.PI / 2;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.material = new THREE.MeshLambertMaterial({
            map: texture,
            side: THREE.DoubleSide
        })
    }

    display() {
        const mesh = new THREE.Mesh(this.surface, this.material);
        mesh.position.set(...this.position);
        mesh.rotation.set(...this.rotation);
        mesh.scale.set(...this.scale);
        this.app.scene.add(mesh);
    }
}

export { MyNewspaper };