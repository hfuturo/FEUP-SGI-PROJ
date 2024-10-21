import * as THREE from 'three';
import { MyFrame } from './MyFrame.js';

class MyPainting {

    constructor(app, horizontalFrameInfo, verticalFrameInfo, position, texture, imageRotation) {
        this.app = app;
        this.horizontalInfo = horizontalFrameInfo;
        this.verticalInfo = verticalFrameInfo;
        this.position = position;
        this.texture = texture;
        this.imageRotation = imageRotation;
        this.frame = new MyFrame(this.app, this.horizontalInfo, this.verticalInfo, this.position);
    } 

    display() {
        this.frame.display();
        this.#paint();
        this.#illuminatePainting();
    }

    #paint() {
        const image = new THREE.PlaneGeometry(this.horizontalInfo.depth, this.verticalInfo.depth);
        const imageTexture = new THREE.TextureLoader().load('textures/' + this.texture);
        imageTexture.wrapS = THREE.RepeatWrapping;
        imageTexture.wrapT = THREE.RepeatWrapping;

        const imageMaterial = new THREE.MeshLambertMaterial({
            map: imageTexture
        });

        const mesh = new THREE.Mesh(image, imageMaterial);
        mesh.position.set(...this.position);
        mesh.rotation.set(...this.imageRotation);
        this.app.scene.add(mesh);
    }

    #illuminatePainting() {
        const spotLight = new THREE.SpotLight(0xFFFFFF, 100, 0);
        spotLight.position.set(0, 10, this.position[2]);
        spotLight.target.position.set(...this.position);
        spotLight.angle = Math.PI / 25;
        spotLight.penumbra = 0.6;
        spotLight.decay = 3;
        this.app.scene.add(spotLight);
    }

}

export { MyPainting };