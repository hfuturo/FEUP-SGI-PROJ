import * as THREE from 'three';
import { MyCandle } from './MyCandle.js';

class MyCake {

    constructor(app, radius, number, segments, heightSegments, angle, material, position) {
        this.app = app;
        this.radius = radius;
        this.number = number;
        this.segments = segments;
        this.heightSegments = heightSegments;
        this.angle = angle;
        this.material = material;
        this.position = position;

        this.candles = (() => {
            const candles = [];

            for (let i = 0; i < 2; i++) {
                candles.push(new MyCandle(this.app, 0.025, 0.2, [-0.1 + 0.2 * i, 3.4, 0]));

            }

            return candles;
        })();
    }

    display() {
        const cake = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.number,
            this.segments,
            this.heightSegments,
            false,
            0,
            Math.PI * 1.8
        );

        const textureLoader = new THREE.TextureLoader();
        const cakeTexture = textureLoader.load('textures/cake.jpg');
        const icingTexture = textureLoader.load('textures/icing.jpg');
        const cakeMaterial = new THREE.MeshLambertMaterial({
            map: cakeTexture
        });
        const icingMaterial = new THREE.MeshLambertMaterial({
            map: icingTexture
        });

        const mesh = new THREE.Mesh(cake, icingMaterial);
        mesh.position.set(...this.position);
        this.app.scene.add(mesh);

        // fill inside of cake
        const inside = new THREE.PlaneGeometry(this.radius, this.radius);
        const blueAxisSliceInside = new THREE.Mesh(inside, cakeMaterial);

        // nao testei a posicao do Z, vai na fé 
        blueAxisSliceInside.position.set(0, this.position[1], this.radius / 2);
        blueAxisSliceInside.rotation.set(0, -Math.PI / 2, 0);
        this.app.scene.add(blueAxisSliceInside);

        const angledInsideMesh = new THREE.Mesh(inside, cakeMaterial);
        angledInsideMesh.position.set(
            Math.sin(this.angle) * this.radius / 2, 
            this.position[1], 
            Math.cos(this.angle) * this.radius / 2
        );
        angledInsideMesh.rotation.y = Math.PI * 2 - (this.angle - 0.1 * Math.PI)
        this.app.scene.add(angledInsideMesh);

        this.candles.forEach(candle => candle.display());
        this.#addSpotLight();
    }

    #addSpotLight() {
        const spotLight = new THREE.SpotLight(0xFFFFFF, 100, 0);
        spotLight.position.set(0, 10, 0);
        spotLight.penumbra = 0.9;
        spotLight.angle = Math.PI / 15;
        this.app.scene.add(spotLight);
    }

}

export { MyCake };