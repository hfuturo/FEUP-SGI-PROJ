import * as THREE from "three";
import { MyNurbsBuilder } from "./MyNurbsBuilder.js"

class MyPetal {
    /**
     * Creates an instance of MyPetal.
     * 
     * @constructor
     * @param {MyApp} app - The application context.
     * @param {THREE.Material} material - The material to be used for the petal.
     * @param {Array<number>} position - The position of the petal in the format [x, y, z].
     * @param {Array<number>} rotation - The rotation of the petal in the format [x, y, z].
     * @param {Array<number>} [scale=[1, 1, 1]] - The scale of the petal in the format [x, y, z].
     */
    constructor(app, material, position, rotation, scale=[1, 1, 1]) {
        this.app = app;
        this.nurbsBuilder = new MyNurbsBuilder();
        this.material = material;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;

        const controlPoints = [// U = 0
            [// V = 0..1
                [-0.125, 0, 0, 1],
                [0.125, 0, 0, 1]
            ],
            // U = 1
            [// V = 0..1
                [-0.225, 0.5, 0, 1],
                [0.225, 0.5, 0, 1]
            ],
            // U = 2
            [// V = 0..1
                [0, 0.75, 0, 1],
                // slightly different position as to not create visual artifacts
                [0.001, 0.75, 0, 1]
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