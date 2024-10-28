import * as THREE from 'three';

class MyLightsSupport {

    constructor(app, material) {
        this.app = app;
        this.material = material;
    }

    display() {
        const group = new THREE.Group();

        const connections = this.#buildConnectionToCeiling();
        const support = this.#buildSupport();

        group.add(connections);
        group.add(support);

        this.app.scene.add(group);
    }

    #buildConnectionToCeiling() {
        const connections = new THREE.Group();

        for (let i = 0; i < 4; i++) {
            const line1 = new THREE.LineCurve3(
                new THREE.Vector3(-4, 9.5, 15 - 5 * i),
                new THREE.Vector3(-4, 10, 15 - 5 * i)
            );

            const line2 = new THREE.LineCurve3(
                new THREE.Vector3(4, 9.5, 15 - 5 * i),
                new THREE.Vector3(4, 10, 15 - 5 * i)
            );

            connections.add(this.#buildConnection(line1));
            connections.add(this.#buildConnection(line2));
        }

        // frontal line connection
        connections.add(this.#buildConnection(
            new THREE.LineCurve3(
                new THREE.Vector3(0, 9.5, 0),
                new THREE.Vector3(0, 10, 0)
            ))
        );

        return connections;
    }

    #buildConnection(line) {
        const mesh = this.#constructSupportCurves(line, 2);
        return mesh;
    }

    #buildSupport() {
        const leftLine = new THREE.LineCurve3(
            new THREE.Vector3(-4, 9.5, 20), 
            new THREE.Vector3(-4, 9.5, 0.1)
        );
        const leftMesh = this.#constructSupportCurves(leftLine, 2);

        const leftCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-4, 9.5, 0.1),
            new THREE.Vector3(-4, 9.5, 0),
            new THREE.Vector3(-3.9, 9.5, 0)
        );
        const leftCurvedMesh = this.#constructSupportCurves(leftCurve, 1000);

        const frontalLine = new THREE.LineCurve3(
            new THREE.Vector3(-3.9, 9.5, 0), 
            new THREE.Vector3(3.9, 9.5, 0)
        );
        const frontalMesh = this.#constructSupportCurves(frontalLine, 2);

        const rightCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(4, 9.5, 0.1),
            new THREE.Vector3(4, 9.5, 0),
            new THREE.Vector3(3.9, 9.5, 0)
        );
        const rightCurveMesh = this.#constructSupportCurves(rightCurve, 1000);

        const rightLine = new THREE.LineCurve3(
            new THREE.Vector3(4, 9.5, 20), 
            new THREE.Vector3(4, 9.5, 0.1)
        );
        const rightMesh = this.#constructSupportCurves(rightLine, 2);

        const support = new THREE.Group();
        support.add(leftMesh)
        support.add(leftMesh);
        support.add(leftCurvedMesh);
        support.add(frontalMesh);
        support.add(rightCurveMesh);
        support.add(rightMesh);

        return support;
    }

    #constructSupportCurves(curve, segments) {
        const support = new THREE.TubeGeometry(curve, segments, 0.1);
        const mesh = new THREE.Mesh(support, this.material);
        return mesh;
    }


}

export { MyLightsSupport };