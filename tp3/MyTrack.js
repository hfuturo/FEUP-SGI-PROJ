import * as THREE from 'three';

class MyTrack {
    constructor(scene, route, obstacles, powerUps) {
        this.scene = scene;
        this.route = route;
        this.obstacles = obstacles;
        this.powerUps = powerUps;

        const geometry = new THREE.TubeGeometry(this.route, 100, 1, 3, true);
        this.representation = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00 }));
    }

    display() {
        this.scene.add(this.representation);

        this.obstacles.forEach(obstacle => {
            obstacle.display();
        });

        this.powerUps.forEach(powerUp => {
            powerUp.display();
        });
    }

}

export { MyTrack };