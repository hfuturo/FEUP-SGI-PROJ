import * as THREE from 'three';
import { MyApp } from './MyApp.js';
import { MyObstacle } from './MyObstacle.js';
import { MyPowerUp } from './MyPowerUp.js';

/**
 * @class MyTrack
 * 
 * Represents a track.
 */
class MyTrack {

    /**
     * Creates an instance of MyTrack.
     * 
     * @param {MyApp} app - The application instance.
     * @param {MyObstacle[]} obstacles - Array containg the obstacles of the track. 
     * @param {MyPowerUp[]} powerUps - Array containing the powerups of the track.
     */
    constructor(app, obstacles, powerUps) {
        this.app = app;
        this.obstacles = obstacles;
        this.powerUps = powerUps;

        this.clock = new THREE.Clock();

        this.curve = null;

        this.width = 20;

        const texture = new THREE.TextureLoader().load("./textures/road.jpg");

        this.material = new THREE.MeshBasicMaterial({ map: texture });
        this.material.map.repeat.set(12, 2);
        this.material.map.wrapS = THREE.RepeatWrapping;
        this.material.map.wrapT = THREE.RepeatWrapping;

        this.representation = this.#createTrack();
    }

    /**
     * Displays the track, obstacles and powerups.
     */
    display() {
        this.representation.forEach((representation) => this.app.scene.add(representation));

        this.obstacles.forEach(obstacle => {
            obstacle.display();
        });

        this.powerUps.forEach(powerUp => {
            powerUp.display();
        });
    }

    /**
     * Create a track from a list of THREE.Vector3 points.
     * 
     * @param {number} width - Width of the track.
     * @returns {(THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap> | THREE.Mesh<THREE.TubeGeometry, THREE.ShadowMaterial, THREE.Object3DEventMap>)[]}
     */
    #createTrack(width=20) {
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
        ].map(point => point.multiplyScalar(8));

        this.middleX = 6 * 8;

        this.curve = new THREE.CatmullRomCurve3(points);
        const geometry = new THREE.TubeGeometry(this.curve, 100, width, 3, true);

        const mesh = new THREE.Mesh(geometry, this.material);
        mesh.scale.set(1, 0.01, 1);

        const shadows = new THREE.Mesh(geometry, new THREE.ShadowMaterial({ opacity: 0.25 }));
        shadows.scale.set(1, 0.01, 1);
        shadows.receiveShadow = true;

        return [mesh, shadows];
    }

    /**
     * Update the track width.
     * 
     * @param {number} width - New track width.
     */
    updateTrack(width) {
        this.representation.forEach((representation) => this.app.scene.remove(representation));
        this.representation = this.#createTrack(width);
        this.app.scene.forEach((representation) => this.app.scene.add(representation));
    }

    /**
     * Returns all obstascles from the track.
     * 
     * @returns {MyObstacle[]}
     */
    getObstacles() {
        return this.obstacles;
    }

    /**
     * Returns all powerups from the track.
     * 
     * @returns {MyPowerUp[]}
     */
    getPowerUps() {
        return this.powerUps;
    }

    /**
     * Checks if a balloon is outside of the track by comparing the distance of the shadow of the balloon and the closest center point of the track.
     * The track will be divided into several points and each point will be compared to the shadow position.
     * Returns an objects containg the closest center point of the track and a boolean.
     * 
     * @param {THREE.Vector3} shadowPos - The position of the shadow.
     * @param {number} margin - Distance that will decide if a balloon is offtrack or not.
     * @param {number} [nPoints=1000] - The number of points into which the curve will be divided.
     * 
     * @returns {{closestPoint: number; offTrack: boolean;}}
     */
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

    /**
     * Updates both powerups and obstacles.
     */
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