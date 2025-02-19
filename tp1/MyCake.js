import * as THREE from 'three';
import { MyCandle } from './MyCandle.js';
import { MyGlassBox } from './MyGlassBox.js';
import { MyLight } from './MyLight.js';

class MyCake {

    /**
     * Creates an instance of MyCake.
     * 
     * @constructor
     * @param {MyApp} app - The application context.
     * @param {number} radius - The radius of the cake.
     * @param {number} height - The height of the cake.
     * @param {number} segments - The number of segments for the cake.
     * @param {number} heightSegments - The number of height segments for the cake.
     * @param {number} angle - The angle of the cake, to remove a slice.
     * @param {Array<number>} position - The position of the cake in [x, y, z] coordinates.
     * @param {Object} glassBoxInfo - Information for creating the glass box - {width:number, height:number, depth:number, material:THREE.Material}
     */
    constructor(app, radius, height, segments, heightSegments, angle, position, glassBoxInfo) {
        this.app = app;
        this.radius = radius;
        this.height = height;
        this.segments = segments;
        this.heightSegments = heightSegments;
        this.angle = angle;
        this.position = position;

        this.candle = new MyCandle(this.app, 0.025, 0.2, [0.01, 3.4, -0.1]);

        this.glassBox = new MyGlassBox(this.app, glassBoxInfo, [this.position[0], this.position[1]-0.5, this.position[2]]);
        this.spotLight = new MyLight(this.app, this.position, 4, 10, Math.PI / 10, 0.3, 0, true, false);
    }

    display() {
        const cake = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.height,
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

        // fill inside of cake
        const inside = new THREE.PlaneGeometry(this.radius, this.radius);
        const blueAxisSliceInside = new THREE.Mesh(inside, cakeMaterial);
        blueAxisSliceInside.position.set(0, this.position[1], this.radius / 2);
        blueAxisSliceInside.rotation.set(0, -Math.PI / 2, 0);

        const angledInsideMesh = new THREE.Mesh(inside, cakeMaterial);
        angledInsideMesh.position.set(
            Math.sin(this.angle) * this.radius / 2, 
            this.position[1], 
            Math.cos(this.angle) * this.radius / 2
        );
        angledInsideMesh.rotation.y = Math.PI * 2 - (this.angle - 0.1 * Math.PI)

        this.candle.display();

        const group = new THREE.Group();
        group.add(mesh);
        group.add(blueAxisSliceInside);
        group.add(angledInsideMesh);
        group.add(this.glassBox.createMesh());

        this.app.scene.add(group);
        this.app.scene.add(this.spotLight.display());
    }
}

export { MyCake };