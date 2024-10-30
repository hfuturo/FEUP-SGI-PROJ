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

        const texture1 = new THREE.TextureLoader().load('textures/newspaper.jpg');
        texture1.rotation = Math.PI / 2;
        texture1.wrapS = THREE.RepeatWrapping;
        texture1.wrapT = THREE.RepeatWrapping;
        texture1.repeat.set(0.5, 1);
        texture1.offset.set(0.5, 0);
        this.material1 = new THREE.MeshLambertMaterial({
            map: texture1,
            side: THREE.DoubleSide
        })

        const texture2 = texture1.clone();
        texture2.offset.set(0.5, 0);
        texture2.repeat.set(-0.5, 1);
        this.material2 = new THREE.MeshLambertMaterial({
            map: texture2,
            side: THREE.DoubleSide
        })
    }

    display() {
        const mesh = new THREE.Mesh(this.surface, this.material1);
        mesh.position.set(...this.position);
        mesh.rotation.set(this.rotation[0], this.rotation[1], this.rotation[2] - 0.07);
        mesh.scale.set(...this.scale);

        const mesh2 = mesh.clone();
        mesh2.material = this.material2;
        mesh2.scale.x *= -1;
        mesh2.rotation.z *= -1;

        const group = new THREE.Group();
        group.add(mesh);
        group.add(mesh2);
        group.add(this.glassBox.createMesh());

        this.app.scene.add(group);
    }
}

export { MyNewspaper };