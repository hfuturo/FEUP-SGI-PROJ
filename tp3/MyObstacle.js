import * as THREE from 'three';

class MyObstacle {

    constructor(app, pos) {
        this.app = app;

        this.representation = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
        this.representation.position.set(pos[0], pos[1], pos[2]);
    }

    display() {
        this.app.scene.add(this.representation);
    }

}

export { MyObstacle };