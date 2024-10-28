import * as THREE from 'three';

class MyGlassBox {

    constructor(app, info, position) {
        this.app = app;
        this.info = info;
        this.position = position;
    }

    createMesh() {
        const box = new THREE.BoxGeometry(this.info.width, this.info.height, this.info.depth);

        const padding = this.info.height / 2;

        const mesh = new THREE.Mesh(box, this.info.material);
        mesh.position.set(this.position[0], this.position[1] + padding, this.position[2]);

        return mesh;
    }
}

export { MyGlassBox };