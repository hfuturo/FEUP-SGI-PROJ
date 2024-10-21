import * as THREE from 'three';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

class MyJar {
    constructor(app, material, position, rotation=[0, 0, 0], scale=[1, 1, 1]) {
        this.app = app;
        this.nurbsBuilder = new MyNurbsBuilder();
        this.material = material;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;

        const controlPoints = [// U = 0
            [// V = 0..4
                [0, 0, 0.25, 1],
                [0.25, 0, 0.25, Math.sqrt(2) / 2],
                [0.25, 0, 0, 1],
                [0.25, 0, -0.25, Math.sqrt(2) / 2],
                [0, 0, -0.25, 1]
            ],
            // U = 1
            [// V = 0..4
                [0, 0.75, 0.75, 1],
                [0.75, 0.75, 0.75, Math.sqrt(2) / 2],
                [0.75, 0.75, 0, 1],
                [0.75, 0.75, -0.75, Math.sqrt(2) / 2],
                [0, 0.75, -0.75, 1]
            ],
            // U = 2
            [// V = 0..4
                [0, 1.25, 0.25, 1],
                [0.25, 1.25, 0.25, Math.sqrt(2) / 2],
                [0.25, 1.25, 0, 1],
                [0.25, 1.25, -0.25, Math.sqrt(2) / 2],
                [0, 1.25, -0.25, 1]
            ],
            // U = 3
            [// V = 0..4
                [0, 1.5, 0.6, 1],
                [0.6, 1.5, 0.6, Math.sqrt(2) / 2],
                [0.6, 1.5, 0, 1],
                [0.6, 1.5, -0.6, Math.sqrt(2) / 2],
                [0, 1.5, -0.6, 1]
            ]
        ]
        this.surface = this.nurbsBuilder.build(controlPoints, 3, 4, 8, 8);
    }

    display() {
        const mesh1 = new THREE.Mesh(this.surface, this.material);
        mesh1.position.set(...this.position);
        mesh1.rotation.set(...this.rotation);
        mesh1.scale.set(...this.scale);
        this.app.scene.add(mesh1);

        const mesh2 = new THREE.Mesh(this.surface, this.material);
        mesh2.position.set(...this.position);
        mesh2.rotation.set(this.rotation[0], this.rotation[1] + Math.PI, this.rotation[2]);
        mesh2.scale.set(...this.scale);
        this.app.scene.add(mesh2);
    }
}

export { MyJar };