import * as THREE from 'three';

class MyTrack {
    constructor(app, route, obstacles, powerUps) {
        this.app = app;
        this.route = route;
        this.obstacles = obstacles;
        this.powerUps = powerUps;

        this.representation = this.#createTrack();
    }

    display() {
        this.app.scene.add(this.representation);

        this.obstacles.forEach(obstacle => {
            obstacle.display();
        });

        this.powerUps.forEach(powerUp => {
            powerUp.display();
        });
    }

    #createTrack() {
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 10),
            new THREE.Vector3(1 - Math.cos(Math.PI / 6), 0, 10 + Math.sin(Math.PI / 6)),
            new THREE.Vector3(1 - Math.cos(Math.PI / 4), 0, 10 + Math.sin(Math.PI / 4)),
            new THREE.Vector3(1 - Math.cos(Math.PI / 3), 0, 10 + Math.sin(Math.PI / 3)),
            new THREE.Vector3(2, 0, 12),
            new THREE.Vector3(10, 0, 12),
            new THREE.Vector3(12, 0, 10),
            new THREE.Vector3(12, 0, 6),
            new THREE.Vector3(10, 0, 4),
            new THREE.Vector3(7, 0, 4),
            new THREE.Vector3(6, 0, 0),
            new THREE.Vector3(7, 0, -4),
            new THREE.Vector3(10, 0, -4),
            new THREE.Vector3(12, 0, -6),
            new THREE.Vector3(12, 0, -10),
            new THREE.Vector3(10, 0, -12),
            new THREE.Vector3(2, 0, -12),
            new THREE.Vector3(1 - Math.cos(Math.PI / 3), 0, -10 - Math.sin(Math.PI / 3)),
            new THREE.Vector3(1 - Math.cos(Math.PI / 4), 0, -10 - Math.sin(Math.PI / 4)),
            new THREE.Vector3(1 - Math.cos(Math.PI / 6), 0, -10 - Math.sin(Math.PI / 6)),
            new THREE.Vector3(0, 0, -10),
            new THREE.Vector3(0, 0, -5)
        ].map(point => point.multiplyScalar(4));

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 100, 10, 3, true);
        
        const texture = new THREE.TextureLoader().load("./images/uvmapping.jpg");
        texture.wrapS = THREE.RepeatWrapping;
    
        const material = new THREE.MeshBasicMaterial({ map: texture });
        material.map.repeat.set(3, 3);
        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;

        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(1, 0.01, 1);
        return mesh;
    }

    /**
     * Creates the mesh, the line and the wireframe used to visualize the curve
     */
    #createCurveObjects() {
        let geometry = new THREE.TubeGeometry(
            this.path,
            this.segments,
            this.width,
            3,
            this.closedCurve
        );
        this.mesh = new THREE.Mesh(geometry, this.material);
        this.wireframe = new THREE.Mesh(geometry, this.wireframeMaterial);

        let points = this.path.getPoints(this.segments);
        let bGeometry = new THREE.BufferGeometry().setFromPoints(points);

        // Create the final object to add to the scene
        this.line = new THREE.Line(bGeometry, this.lineMaterial);

        this.curve = new THREE.Group();
        this.mesh.visible = this.showMesh;
        this.wireframe.visible = this.showWireframe;
        this.line.visible = this.showLine;

        this.curve.add(this.mesh);
        this.curve.add(this.wireframe);
        this.curve.add(this.line);

        this.curve.rotateZ(Math.PI);
        this.curve.scale.set(1, 0.01, 1);
        this.app.scene.add(this.curve);
    }

}

export { MyTrack };