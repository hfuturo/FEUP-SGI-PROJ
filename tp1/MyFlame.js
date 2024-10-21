import * as THREE from 'three';

class MyFlame {

    constructor(app, radius, height, position, material) {
        this.app = app;
        this.radius = radius;
        this.height = height;
        this.position = position;
    }

    display() {
        const flame = new THREE.ConeGeometry(this.radius, this.height);
        const texture = new THREE.TextureLoader().load('textures/flame.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const material = new THREE.MeshLambertMaterial({
            map: texture
        });
        const mesh = new THREE.Mesh(flame, material);
        mesh.position.set(...this.position);
        this.app.scene.add(mesh);
    }

}

export { MyFlame };