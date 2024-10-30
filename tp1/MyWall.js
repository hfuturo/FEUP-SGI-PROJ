import * as THREE from 'three';

class MyWall {
    /**
     * Creates an instance of MyWall.
     * 
     * @constructor
     * @param {MyApp} app - The application context.
     * @param {number} length - The length of the wall.
     * @param {number} height - The height of the wall.
     * @param {Array<number>} position - The position of the wall.
     * @param {Array<number>} rotation - The rotation of the wall.
     * @param {THREE.Material} material - The material of the wall.
     * @param {Array<number>} [hole=[]] - The specifications of the hole in the wall. Should be an array of 4 numbers [x1, x2, y1, y2].
     * @param {boolean} [receiveShadow=false] - Whether the wall receives shadows.
     * @param {boolean} [castShadow=false] - Whether the wall casts shadows.
     * @throws {Error} If the hole specification is invalid. 0 <= x1 <= x2 <= length, 0 <= y1 <= y2 <= height.
     */
    constructor(app, length, height, position, rotation, material, hole=[], receiveShadow=false, castShadow=false) {
        this.app = app;
        this.length = length;
        this.height = height;
        this.material = material;
        this.position = position;
        this.rotation = rotation;
        this.hole = hole;
        this.planes = [];
        this.receiveShadow = receiveShadow;
        this.castShadow = castShadow;

        if (this.hole.length != 0 && this.hole.length != 4) {
            throw new Error('Invalid specification of hole');
        }
        
        if (this.hole.length == 4) {
            if (this.hole[0] < 0 || this.hole[0] > length 
                || this.hole[1] < this.hole[0] || this.hole[1] > length 
                || this.hole[2] < 0 || this.hole[2] > height 
                || this.hole[3] < this.hole[2] || this.hole[3] > height)
                throw new Error('Invalid specification of hole');

            // Create 4 planes to form the wall with a hole
            this.planes.push(new THREE.PlaneGeometry(this.hole[0], height));
            this.planes.push(new THREE.PlaneGeometry(length - this.hole[1], height));
            this.planes.push(new THREE.PlaneGeometry(this.hole[1] - this.hole[0], this.hole[2]));
            this.planes.push(new THREE.PlaneGeometry(this.hole[1] - this.hole[0], height - this.hole[3]));

        } else {
            const plane = new THREE.PlaneGeometry(length, height);
            this.planes.push(plane);
        }
    }

    display() {
        if (this.planes.length == 1) {
            const mesh = new THREE.Mesh(this.planes[0], this.material);
            mesh.position.set(...this.position);
            mesh.rotation.set(...this.rotation);
            mesh.receiveShadow = this.receiveShadow;
            mesh.castShadow = this.castShadow;
            this.app.scene.add(mesh);
        } else {
            const mesh1 = new THREE.Mesh(this.planes[0], this.material);
            mesh1.position.x = this.hole[0]/2 - this.length/2;
            mesh1.position.y = this.height/2 - this.height/2;
            mesh1.receiveShadow = this.receiveShadow;
            mesh1.castShadow = this.castShadow;

            const mesh2 = new THREE.Mesh(this.planes[1], this.material);
            mesh2.position.x = this.hole[1] + (this.length - this.hole[1]) / 2 - this.length/2;
            mesh2.position.y = this.height/2 - this.height/2;
            mesh2.receiveShadow = this.receiveShadow;
            mesh2.castShadow = this.castShadow;

            const mesh3 = new THREE.Mesh(this.planes[2], this.material);
            mesh3.position.x = this.hole[0] + (this.hole[1] - this.hole[0]) / 2 - this.length/2;
            mesh3.position.y = this.hole[2]/2 - this.height/2;
            mesh3.receiveShadow = this.receiveShadow;
            mesh3.castShadow = this.castShadow;

            const mesh4 = new THREE.Mesh(this.planes[3], this.material);
            mesh4.position.x = this.hole[0] + (this.hole[1] - this.hole[0]) / 2 - this.length/2;
            mesh4.position.y = this.hole[3] + (this.height - this.hole[3]) / 2 - this.height/2;
            mesh4.receiveShadow = this.receiveShadow;
            mesh4.castShadow = this.castShadow;

            const group = new THREE.Group();
            group.add(mesh1);
            group.add(mesh2);
            group.add(mesh3);
            group.add(mesh4);
            group.position.set(...this.position);
            group.rotation.set(...this.rotation);
            this.app.scene.add(group);
        }
    }
}

export { MyWall };