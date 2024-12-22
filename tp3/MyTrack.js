import * as THREE from 'three';

class MyTrack {
    constructor(app, obstacles, powerUps) {
        this.app = app;
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
            new THREE.Vector3(7, 0, 3),
            new THREE.Vector3(6, 0, 0),
            new THREE.Vector3(7, 0, -3),
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
        ].map(point => point.multiplyScalar(8));

        const curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(curve, 100, 20, 3, true);
        
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

    getObstacles() {
        return this.obstacles;
    }

}

export { MyTrack };