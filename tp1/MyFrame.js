import * as THREE from 'three';

class MyFrame {

    constructor(app, horizontalInfo, verticalInfo, position, textureName='frame.jpg') {
        this.app = app;
        this.horizontalInfo = horizontalInfo;
        this.verticalInfo = verticalInfo;
        this.position = position;

        const texture = new THREE.TextureLoader().load('textures/' + textureName);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.material = new THREE.MeshLambertMaterial({
            map: texture
        });
    }

    display() {
        const horizontalPiece = new THREE.BoxGeometry(this.horizontalInfo.width, this.horizontalInfo.height, this.horizontalInfo.depth);
        const verticalPiece = new THREE.BoxGeometry(this.verticalInfo.width, this.verticalInfo.height, this.verticalInfo.depth);

        const posX = this.position[0];
        const posY = this.position[1];
        const posZ = this.position[2];

        // roda em torno do eixo Y => pedaços da frame mexem-se no eixo do X
        if (this.horizontalInfo.rotation[1] !== 0) {
            this.#buildFrame(horizontalPiece, [posX, posY - this.verticalInfo.depth / 2, posZ], this.horizontalInfo.rotation); // bottom
            this.#buildFrame(verticalPiece, [posX - this.horizontalInfo.depth / 2, posY, posZ], this.verticalInfo.rotation); // left
            this.#buildFrame(horizontalPiece, [posX, posY + this.verticalInfo.depth / 2, posZ], this.horizontalInfo.rotation); // top
            this.#buildFrame(verticalPiece, [posX + this.horizontalInfo.depth / 2, posY, posZ], this.verticalInfo.rotation); // right
        }
        // roda em torno do eixo X => pedaços da frame mexem-se no eixo Z
        else {
            this.#buildFrame(horizontalPiece, [posX, posY - this.verticalInfo.depth / 2, posZ], this.horizontalInfo.rotation); // bottom
            this.#buildFrame(verticalPiece, [posX, posY, posZ + this.horizontalInfo.depth / 2], this.verticalInfo.rotation); // left
            this.#buildFrame(horizontalPiece, [posX, posY + this.verticalInfo.depth / 2, posZ], this.horizontalInfo.rotation); // top
            this.#buildFrame(verticalPiece, [posX, posY, posZ - this.horizontalInfo.depth / 2], this.verticalInfo.rotation); // right
        }
    }

    #buildFrame(piece, position, rotation) {
        const mesh = new THREE.Mesh(piece, this.material);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        this.app.scene.add(mesh);
    }
}

export { MyFrame };