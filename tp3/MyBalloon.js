import * as THREE from "three";

class MyBallon {
    
    constructor(app, boxLength, spehreRadius) {
        this.app = app;
        this.boxLength = boxLength;
        this.spehreRadius = spehreRadius;
    }

    display() {
        const group = new THREE.Group();

        const box = new THREE.Mesh(new THREE.BoxGeometry(this.boxLength, this.boxLength, this.boxLength));
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(this.spehreRadius));
        sphere.position.set(0, this.boxLength/2 + this.spehreRadius * 0.90, 0);

        group.add(box);
        group.add(sphere);

        this.app.scene.add(group);
    }

}

export { MyBallon };

