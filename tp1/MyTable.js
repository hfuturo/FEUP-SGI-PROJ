import * as THREE from 'three';

class MyTable {
    constructor(app, width, length, height, legRadius, topMaterial, legMaterial, position) {
        this.app = app;

        this.width = width;
        this.length = length;
        this.height = height;
        this.top = new THREE.BoxGeometry(this.width, 0.25, this.length);
        this.topMaterial = topMaterial;

        this.leg = new THREE.CylinderGeometry(legRadius, legRadius, this.height);
        this.legMaterial = legMaterial;

        this.position = position;
    }

    display() {
        const topMesh = new THREE.Mesh(this.top, this.topMaterial);
        topMesh.position.set(this.position[0], this.position[1] + this.height, this.position[2]);
        topMesh.castShadow = true;
        this.app.scene.add(topMesh);

        const leg1 = new THREE.Mesh(this.leg, this.legMaterial);
        leg1.position.set(this.position[0] - this.width/2 + 0.4, this.position[1] + this.height/2, this.position[2] - this.length/2 + 0.4);
        this.app.scene.add(leg1);

        const leg2 = new THREE.Mesh(this.leg, this.legMaterial);
        leg2.position.set(this.position[0] + this.width/2 - 0.4, this.position[1] + this.height/2, this.position[2] - this.length/2 + 0.4);
        this.app.scene.add(leg2);

        const leg3 = new THREE.Mesh(this.leg, this.legMaterial);
        leg3.position.set(this.position[0] - this.width/2 + 0.4, this.position[1] + this.height/2, this.position[2] + this.length/2 - 0.4);
        this.app.scene.add(leg3);

        const leg4 = new THREE.Mesh(this.leg, this.legMaterial);
        leg4.position.set(this.position[0] + this.width/2 - 0.4, this.position[1] + this.height/2, this.position[2] + this.length/2 - 0.4);
        this.app.scene.add(leg4);
    }
}

export { MyTable };