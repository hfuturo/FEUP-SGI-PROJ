import * as THREE from 'three';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';
import { MyGlassBox } from './MyGlassBox.js';

class MyNewspaper {
    constructor(app, position, glassBoxInfo, rotation=[0, 0, 0], scale=[1, 1, 1]) {
        this.app = app;
        this.nurbsBuilder = new MyNurbsBuilder();
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.glassBox = new MyGlassBox(this.app, glassBoxInfo, [this.position[0], this.position[1], this.position[2] + 0.7]);

        const controlPoints = [// U = 0
            [// V = 0..3
                [0, 0, 0, 1],
                [0.3, 0.3, 0, 1],
                [0.9, 0, 0, 1],
                [1.2, 0.1, 0, 1]
            ],
            // U = 1
            [// V = 0..3
                [0, 0, 1.4, 1],
                [0.3, 0.3, 1.4, 1],
                [0.9, 0, 1.4, 1],
                [1.2, 0.1, 1.4, 1]
            ],
        ]

        this.surface = this.nurbsBuilder.build(controlPoints, 1, 3, 8, 8);

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
        mesh.rotation.set(this.rotation[0], this.rotation[1], this.rotation[2] - 0.07);
        mesh.scale.set(...this.scale);

        const mesh2 = mesh.clone();
        mesh.scale.x *= -1;
        mesh.rotation.z *= -1;

        const group = new THREE.Group();
        group.add(mesh);
        group.add(mesh2);
        group.add(this.glassBox.createMesh());

        this.app.scene.add(group);
    }
}

export { MyNewspaper };