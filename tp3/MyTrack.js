import * as THREE from 'three';

class MyTrack {
    constructor(app, obstacles, powerUps) {
        this.app = app;
        this.obstacles = obstacles;
        this.powerUps = powerUps;

        this.clock = new THREE.Clock();

        this.curve = null;

        this.scale = 8;
        this.width = 20;

        const texture = new THREE.TextureLoader().load("./textures/uvmapping.jpg");

        this.material = new THREE.MeshBasicMaterial({ map: texture });
        this.material.map.repeat.set(3, 3);
        this.material.map.wrapS = THREE.RepeatWrapping;
        this.material.map.wrapT = THREE.RepeatWrapping;

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

    #createTrack(scale=this.scale, width=this.width) {
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0.1),
            new THREE.Vector3(0, 0, 2),
            new THREE.Vector3(0, 0, 4),
            new THREE.Vector3(0, 0, 6),
            new THREE.Vector3(0, 0, 8),
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
            new THREE.Vector3(0, 0, -8),
            new THREE.Vector3(0, 0, -6),
            new THREE.Vector3(0, 0, -4),
            new THREE.Vector3(0, 0, -2),
            new THREE.Vector3(0, 0, -0.1)
        ].map(point => point.multiplyScalar(scale));

        this.middleX = 6 * scale;

        this.curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(this.curve, 100, width, 3, true);

        const mesh = new THREE.Mesh(geometry, this.material);
        mesh.scale.set(1, 0.01, 1);
        return mesh;
    }

    updateTrack(scale=this.scale, width=this.width) {
        this.app.scene.remove(this.representation);
        this.representation = this.#createTrack(scale, width);
        this.app.scene.add(this.representation);
    }

    getObstacles() {
        return this.obstacles;
    }

    getPowerUps() {
        return this.powerUps;
    }

    isBalloonOffTrack(shadowPos, margin=(this.width * 0.9), nPoints=1000) {
        const curvePoints = this.curve.getSpacedPoints(nPoints);

        let minDistance = Infinity;
        let closestPoint = null;

        curvePoints.forEach((curvePoint) => {
            const distance = shadowPos.distanceTo(curvePoint);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = curvePoint;
            }
        });

        return {
            "closestPoint": closestPoint,
            "offTrack": minDistance > margin
        };
    }

    update() {
        const delta = this.clock.getDelta();
        this.powerUps.forEach(powerUp => {
            powerUp.update(delta);
        });

        this.obstacles.forEach(obstacle => {
            obstacle.update(delta);
        });
    }

}

export { MyTrack };