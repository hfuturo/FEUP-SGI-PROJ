import * as THREE from 'three';

class MyBeetle {

    constructor(app, numberSegments, radius, rotation, planeMaterial) {
        this.app = app;
        this.numberSegments = numberSegments;
        this.radius = radius;
        this.planeMaterial = planeMaterial;
        this.rotation = rotation;
    }

    display() {
        const cubicPoints = [
            new THREE.Vector3(0, 0, 0), 
            new THREE.Vector3(0,  0.5, 0), 
            new THREE.Vector3(0.6, 0.5, 0), 
            new THREE.Vector3(0.6, 0, 0)
        ];

        const smallQuadraticPoints = [
            new THREE.Vector3(0.4, 0, 0),
            new THREE.Vector3(0.4, 0.5, 0),
            new THREE.Vector3(0, 0.5, 0)
        ];

        const bigQuadraticPoints = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0.8, 1, 0)
        ];

        this.#buildcurve(smallQuadraticPoints, [-4.95, 5.2, -0.4]);
        this.#buildcurve(smallQuadraticPoints, [-4.95, 5.7, 0]);
        this.#buildcurve(bigQuadraticPoints, [-4.95, 5.2, 0.8]);
        this.#buildcurve(cubicPoints, [-4.95, 5.2, 0.8], false);
        this.#buildcurve(cubicPoints, [-4.95, 5.2, -0.2], false);
    }

    #buildcurve(points, position, isQuadratic=true) {
        const curve =  isQuadratic ? 
                        new THREE.QuadraticBezierCurve3(...points) :
                        new THREE.CubicBezierCurve3(...points);
        const tube = new THREE.TubeGeometry(curve, this.numberSegments, this.radius);
        const mesh = new THREE.Mesh(tube, this.planeMaterial);
        mesh.position.set(...position);
        mesh.rotation.set(...this.rotation);
        this.app.scene.add(mesh);
    }

}

export { MyBeetle };