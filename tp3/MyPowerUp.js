import * as THREE from 'three';

class MyPowerUp {

    constructor(scene, points) {
        this.scene = scene;
        this.points = points;

        this.representation = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
        this.representation.position.set(position.x, position.y, position.z);
    }

    display() {
        this.scene.add(this.representation);
    }

}

export { MyPowerUp };