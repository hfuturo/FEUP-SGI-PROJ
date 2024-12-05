import * as THREE from 'three';

class MyTrackObject {

    constructor(scene, points) {
        this.scene = scene;
        this.points = points;

        this.representation = new THREE.Mesh(
            new THREE.BoxGeometry(2, 2, 2),
            new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );
    }

    display() {
        this.scene.add(this.representation);
    }

}

export { MyTrackObject };