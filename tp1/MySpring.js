import * as THREE from 'three';

class MySpring {

    constructor(app, turns, radius, position, rotation=[0,0,0], scale=[1,1,1]) {
        this.app = app;
        this.turns = turns;
        this.radius = radius;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }

    display() {
        const points = (() => {
            const points = [];
            let signal = 1;

            for (let i = 0; i < this.turns; i++) {
                points.push(new THREE.Vector3(
                    0.1 * +(i % 2 === 0) * signal,
                    i / 20,
                    0.1 * +(i % 2 !== 0) * signal
                ));

                signal = i % 2 === 0 ? -signal : signal;
            }

            return points;
        })();

        const curve = new THREE.CatmullRomCurve3(points);
        const spring = new THREE.TubeGeometry(curve, this.turns * 2.5, this.radius);
        const texture = new THREE.TextureLoader().load('textures/spring.webp');
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const material = new THREE.MeshLambertMaterial({
            map: texture
        });
        const mesh = new THREE.Mesh(spring, material);
        mesh.rotation.set(...this.rotation);
        mesh.position.set(...this.position);
        mesh.scale.set(...this.scale);
        this.app.scene.add(mesh);
    }
}

export { MySpring };