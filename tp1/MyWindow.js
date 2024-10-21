import * as THREE from 'three'
import { MyFrame } from './MyFrame.js';

class MyWindow {

    constructor(app) {
        this.app = app;

        const horizontalWindowInfo = {width: 0.1, height: 0.1, depth: 5.1, rotation: [0, Math.PI / 2, 0]};
        const verticalWindowInfo = {width: 0.1, height: 0.1, depth: 2, rotation: [Math.PI / 2, 0, 0]};

        this.frame = new MyFrame(this.app, horizontalWindowInfo, verticalWindowInfo, [0, 5, -5], "window_frame.jpg");
    }

    display() {
        // glass
        const texture = new THREE.TextureLoader().load('textures/window.jpg');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const geometry = new THREE.PlaneGeometry(5.1, 2);
        const material = new THREE.MeshPhysicalMaterial({  
            map: texture,
            roughness: 0,  
            transmission: 1,
        });
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(0, 5, -5);
        this.app.scene.add(mesh);

        this.frame.display();
    }

}

export { MyWindow };