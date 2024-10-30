import * as THREE from 'three';

class MyGlassBox {

    /**
     * Creates an instance of MyGlassBox.
     * 
     * @constructor
     * @param {MyApp} app - The application instance.
     * @param {Object} info - Information related to the glass box - {width:number, height:number, depth:number, material:THREE.Material}.
     * @param {Aarray<number>} position - The position of the glass box [x,y,z].
     */
    constructor(app, info, position) {
        this.app = app;
        this.info = info;
        this.position = position;
    }

    createMesh() {
        const box = new THREE.BoxGeometry(this.info.width, this.info.height, this.info.depth);

        const padding = this.info.height / 2;

        const mesh = new THREE.Mesh(box, this.info.material);
        mesh.position.set(this.position[0], this.position[1] + padding, this.position[2]);

        return mesh;
    }
}

export { MyGlassBox };