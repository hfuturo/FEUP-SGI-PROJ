import * as THREE from "three";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js"

class MyPetal {
    constructor(app, material, position, rotation, scale=[1, 1, 1]) {
        this.app = app;
        this.nurbsBuilder = new MyNurbsBuilder();
        this.material = material;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;

        const controlPoints = [// U = 0
            [// V = 0..1
                [0, 0, 0, 1],
                [0.25, 0, 0, 1]
            ],
            // U = 1
            [// V = 0..1
                [-0.1, 0.5, 0, 1],
                [0.35, 0.5, 0, 1]
            ],
            // U = 2
            [// V = 0..1
                [0.125, 0.75, 0, 1],
                [0.125, 0.75, 0, 1]
            ]
        ]
   
        this.surface = this.nurbsBuilder.build(controlPoints, 2, 1, 8, 8);
    }

    display() {
        const mesh = new THREE.Mesh(this.surface, this.material);
        mesh.position.set(...this.position);
        mesh.rotation.set(...this.rotation);
        mesh.scale.set(this.scale[0]*0.7, this.scale[1]*0.7, this.scale[2]*0.7);
        this.app.scene.add(mesh);
    }
}

export { MyPetal };