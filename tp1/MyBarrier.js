import * as THREE from 'three';

/**
 * Builds a rope supported by either one or two poles.
 */
class MyBarrier {
    /**
     * Create a MyBarrier instance.
     * @param {MyApp} app - The application context containing the scene.
     * @param {Array<number>} position - The position of the barrier in the format [x, y, z].
     * @param {number} [rotationY=0] - The rotation around the Y-axis.
     * @param {boolean} [double=true] - Whether the barrier has two poles, or the rope is left hanging.
     */
    constructor(app, position, rotationY=0, double=true) {
        this.app = app;
        this.position = position;
        this.rotationY = rotationY;
        this.double = double;

        this.poleMaterial = new THREE.MeshPhongMaterial({color: 0xffd700});
        this.ropeMaterial = new THREE.MeshPhongMaterial({color: 0xff0000});

        this.poleMesh = this.#buildPole();
        this.ropeMesh = this.#buildRope(); 
    }

    #buildPole() {       
        const base = new THREE.CylinderGeometry(0.5, 0.5, 0.15);
        const baseMesh = new THREE.Mesh(base, this.poleMaterial);
        baseMesh.position.y = 0.075;
        
        const pole = new THREE.CylinderGeometry(0.1, 0.1, 2.5);
        const poleMesh = new THREE.Mesh(pole, this.poleMaterial);
        poleMesh.position.y = 1.4;

        const top = new THREE.SphereGeometry(0.2);
        const topMesh = new THREE.Mesh(top, this.poleMaterial);
        topMesh.position.y = 2.8;

        const support11 = new THREE.CylinderGeometry(0.01, 0.01, 0.1);
        const support11Mesh = new THREE.Mesh(support11, this.poleMaterial);
        support11Mesh.position.x = 0.1;
        support11Mesh.position.y = 2.5;
        support11Mesh.rotation.z = Math.PI / 2;

        const support12 = new THREE.TorusGeometry(0.05, 0.01);
        const support12Mesh = new THREE.Mesh(support12, this.poleMaterial);
        support12Mesh.position.x = 0.2;
        support12Mesh.position.y = 2.5;

        const suport21Mesh = support11Mesh.clone();
        suport21Mesh.position.x = -0.1;

        const suport22Mesh = support12Mesh.clone();
        suport22Mesh.position.x = -0.2;

        const group = new THREE.Group();
        group.add(baseMesh);
        group.add(poleMesh);
        group.add(topMesh);
        group.add(support11Mesh);
        group.add(support12Mesh);
        group.add(suport21Mesh);
        group.add(suport22Mesh);

        return group;
    }

    #buildRope() {
        const rope = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.4, 0.7, 0),
            new THREE.Vector3(0.55, 1.7, 0),
            new THREE.Vector3(0.4, 2.7, 0),
            new THREE.Vector3(0, 3.4, 0)
        ]), 64, 0.05);
        const ropeMesh = new THREE.Mesh(rope, this.ropeMaterial);
        ropeMesh.position.x = 0.3;
        ropeMesh.position.y = 2.45;
        ropeMesh.rotation.z = -Math.PI / 2;

        const tip11 = new THREE.CylinderGeometry(0.05, 0.05, 0.05);
        const tip11Mesh = new THREE.Mesh(tip11, this.poleMaterial);
        tip11Mesh.position.x = 0.3;
        tip11Mesh.position.y = 2.45;
        tip11Mesh.rotation.z = Math.PI / 3;

        const tip12 = new THREE.TorusGeometry(0.05, 0.01);
        const tip12Mesh = new THREE.Mesh(tip12, this.poleMaterial);
        tip12Mesh.position.x = 0.25;
        tip12Mesh.position.y = 2.47;
        tip12Mesh.rotation.x = Math.PI / 2;
        tip12Mesh.rotation.y = -Math.PI / 6;

        const tip21Mesh = tip11Mesh.clone();
        tip21Mesh.position.x = 3.7;
        tip21Mesh.rotation.z = -Math.PI / 3;

        const tip22Mesh = tip12Mesh.clone();
        tip22Mesh.position.x = 3.75;
        tip22Mesh.rotation.y = Math.PI / 6;

        const group = new THREE.Group();
        group.add(ropeMesh);
        group.add(tip11Mesh);
        group.add(tip12Mesh);
        group.add(tip21Mesh);
        group.add(tip22Mesh);

        return group;
    }

    display() {
        const barrier = new THREE.Group();
        barrier.add(this.poleMesh);

        if (this.double) {
            const poleMesh2 = this.poleMesh.clone();
            poleMesh2.position.x = 4;
            barrier.add(poleMesh2);
        }

        barrier.add(this.ropeMesh);

        barrier.position.set(...this.position);
        barrier.rotation.y = this.rotationY;
        this.app.scene.add(barrier);
    }
}

export { MyBarrier };