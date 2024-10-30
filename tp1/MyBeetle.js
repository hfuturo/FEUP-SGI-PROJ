import * as THREE from 'three';

class MyBeetle {

    /**
     * Creates an instance of MyBeetle.
     * 
     * @param {MyApp} app - The application context.
     * @param {number} numberSegments - The number of segments for each tube.
     * @param {number} radius - The radius of the beetle tubes.
     * @param {Array<number>} position - The position of the beetle [x, y, z].
     * @param {Array<number>} rotation - The rotation of the beetle [x, y, z].
     */
    constructor(app, numberSegments, radius, position, rotation) {
        this.app = app;
        this.numberSegments = numberSegments;
        this.radius = radius;
        this.position = position;
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

        const qMesh1 = this.#buildcurve(new THREE.QuadraticBezierCurve3(...smallQuadraticPoints), [0.4, 0, 0]);
        const qMesh2 = this.#buildcurve(new THREE.QuadraticBezierCurve3(...smallQuadraticPoints), [0, 0.5, 0]);
        const qMesh3 = this.#buildcurve(new THREE.QuadraticBezierCurve3(...bigQuadraticPoints), [-0.8, 0, 0]);
        const cMesh1 = this.#buildcurve(new THREE.CubicBezierCurve3(...cubicPoints), [-0.8, 0, 0]);
        const cMesh2 = this.#buildcurve(new THREE.CubicBezierCurve3(...cubicPoints), [0.2, 0, 0]);

        const group = new THREE.Group();
        group.add(qMesh1);
        group.add(qMesh2);
        group.add(qMesh3);
        group.add(cMesh1);
        group.add(cMesh2);

        group.position.set(...this.position);
        group.rotation.set(...this.rotation);

        this.app.scene.add(group);
    }

    #buildcurve(curve, position) {
        const tube = new THREE.TubeGeometry(curve, this.numberSegments, this.radius);
        const mesh = new THREE.Mesh(tube);
        mesh.position.set(...position);
        return mesh;
    }
}

export { MyBeetle };