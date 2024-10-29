import * as THREE from 'three';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

class MyJar {
    constructor(app, material, materialInside, position, rotation=[0, 0, 0], scale=[1, 1, 1]) {
        this.app = app;
        this.nurbsBuilder = new MyNurbsBuilder();
        this.material = material;
        this.materialInside = materialInside;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;

        const controlPoints1 = [// U = 0
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
        this.surface1 = this.nurbsBuilder.build(controlPoints1, 3, 4, 8, 8);

        const controlPoints2 = [// U = 0
            [// V = 0..4
                [0, 0, 0.25, 1],
                [0.25, 0, 0.25, Math.sqrt(2) / 2],
                [0.25, 0, 0, 1],
                [0.25, 0, -0.25, Math.sqrt(2) / 2],
                [0, 0, -0.25, 1]
            ],
            // U = 1
            [// V = 0..4
                [0, 0.75, 1, 1],
                [1, 0.75, 1, Math.sqrt(2) / 2],
                [1, 0.75, 0, 1],
                [1, 0.75, -1, Math.sqrt(2) / 2],
                [0, 0.75, -1, 1]
            ],
            // U = 2
            [// V = 0..4
                [0, 1.25, 0.3, 1],
                [0.3, 1.25, 0.3, Math.sqrt(2) / 2],
                [0.3, 1.25, 0, 1],
                [0.3, 1.25, -0.3, Math.sqrt(2) / 2],
                [0, 1.25, -0.3, 1]
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
        this.surface2 = this.nurbsBuilder.build(controlPoints2, 3, 4, 8, 8);

        this.circle = new THREE.CircleGeometry(0.49, 32);
    }

    display() {
        const mesh1 = new THREE.Mesh(this.surface1, this.material);
        mesh1.position.set(...this.position);
        mesh1.rotation.set(...this.rotation);
        mesh1.scale.set(...this.scale);
        this.app.scene.add(mesh1);

        const mesh2 = new THREE.Mesh(this.surface1, this.material);
        mesh2.position.set(...this.position);
        mesh2.rotation.set(this.rotation[0], this.rotation[1] + Math.PI, this.rotation[2]);
        mesh2.scale.set(...this.scale);
        this.app.scene.add(mesh2);

        const mesh3 = new THREE.Mesh(this.surface2, this.material);
        mesh3.position.set(...this.position);
        mesh3.rotation.set(...this.rotation);
        mesh3.scale.set(...this.scale);
        this.app.scene.add(mesh3);

        const mesh4 = new THREE.Mesh(this.surface2, this.material);
        mesh4.position.set(...this.position);
        mesh4.rotation.set(this.rotation[0], this.rotation[1] + Math.PI, this.rotation[2]);
        mesh4.scale.set(...this.scale);
        this.app.scene.add(mesh4);

        const meshCircle = new THREE.Mesh(this.circle, this.materialInside);
        meshCircle.position.set(this.position[0], this.position[1] + 1*this.scale[1], this.position[2]);
        meshCircle.rotation.set(-Math.PI / 2, 0, 0);
        meshCircle.scale.set(...this.scale);
        this.app.scene.add(meshCircle);
    }
}

export { MyJar };