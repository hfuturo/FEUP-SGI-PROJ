import * as THREE from 'three';
import { MyPetal } from './MyPetal.js';

class MyFlower {
    constructor(app, position, tubularSegments, radius, stemMaterial, receptacleMaterial, petalMaterial, rotationY=0, scale=[1, 1, 1], numPetals=8) {
        this.app = app;
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.3, 0.5, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 1.25, 0)
        ]);        
        this.tube = new THREE.TubeGeometry(curve, tubularSegments, radius);
        this.position = position;
        this.rotationY = rotationY;
        this.scale = scale;
        this.stemMaterial = stemMaterial;
        this.receptacleMaterial = receptacleMaterial;

        this.receptacle = new THREE.SphereGeometry(radius*2);

        this.petals = []
        for (let i = 0; i < Math.PI * 2; i += (Math.PI * 2 / numPetals)) {
            if (i == Math.PI) continue;
            
            this.petals.push(new MyPetal(
                this.app,
                petalMaterial,
                [this.position[0], (this.position[1] + 1.25)*this.scale[1], this.position[2]],
                [0, this.rotationY, i],
                this.scale
            ));
        }        
    }

    display() {
        const tubeMesh = new THREE.Mesh(this.tube, this.stemMaterial);
        tubeMesh.position.set(...this.position);
        tubeMesh.rotation.y = this.rotationY;
        tubeMesh.scale.set(...this.scale);
        this.app.scene.add(tubeMesh);

        const receptacleMesh = new THREE.Mesh(this.receptacle, this.receptacleMaterial);
        receptacleMesh.position.set(this.position[0], (this.position[1] + 1.25)*this.scale[1], this.position[2]);
        receptacleMesh.rotation.y = this.rotationY;
        receptacleMesh.scale.set(...this.scale);
        this.app.scene.add(receptacleMesh);

        this.petals.forEach(petal => {
            petal.display();
        });
    }
}

export { MyFlower };