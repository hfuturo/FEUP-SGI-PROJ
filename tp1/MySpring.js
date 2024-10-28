import * as THREE from 'three';
import { MyGlassBox } from './MyGlassBox.js';

class MySpring {

    constructor(app, segments, height, radius, position, glassBoxInfo, rotation=[0,0,0], scale=[1,1,1]) {
        this.app = app;
        this.segments = segments;
        this.height = height;
        this.radius = radius;
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.glassBox = new MyGlassBox(this.app, glassBoxInfo, [this.position[0] + this.height / this.segments, this.position[1] - 0.1, this.position[2]]);
    }

    display() {
        const points = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < Math.PI*2; j += 2*Math.PI/this.segments) {
                points.push(new THREE.Vector3(
                    Math.cos(j) * this.radius,
                    0.1*(i + j/(2*Math.PI)),
                    Math.sin(j) * this.radius
                ));
            }
        }

        const curve = new THREE.CatmullRomCurve3(points);
        const spring = new THREE.TubeGeometry(curve, points.length, 0.01);
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

        const group = new THREE.Group();
        group.add(mesh);
        group.add(this.glassBox.createMesh());

        this.app.scene.add(group);
    }
}

export { MySpring };