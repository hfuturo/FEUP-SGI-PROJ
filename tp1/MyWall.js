import * as THREE from 'three';

class MyWall {
    // hole: [x start (0 <= x <= length), x end (x_start <= x <= length), y start (0 <= y <= height), y end (y_start <= y <= height)]
    constructor(app, length, height, position, rotation, material, hole=[]) {
        this.app = app;
        this.length = length;
        this.height = height;
        this.material = material;
        this.position = position;
        this.rotation = rotation;
        this.hole = hole;
        this.planes = [];

        if (this.hole.length != 0 && this.hole.length != 4) {
            throw new Error('Invalid specification of hole');
        }
        
        if (this.hole.length == 4) {
            if (this.hole[0] < 0 || this.hole[0] > length 
                || this.hole[1] < this.hole[0] || this.hole[1] > length 
                || this.hole[2] < 0 || this.hole[2] > height 
                || this.hole[3] < this.hole[2] || this.hole[3] > height)
                throw new Error('Invalid specification of hole');

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
            this.app.scene.add(mesh);
        } else {
            const mesh1 = new THREE.Mesh(this.planes[0], this.material);
            mesh1.position.x = this.hole[0]/2 - this.length/2;
            mesh1.position.y = this.height/2 - this.height/2;

            const mesh2 = new THREE.Mesh(this.planes[1], this.material);
            mesh2.position.x = this.hole[1] + (this.length - this.hole[1]) / 2 - this.length/2;
            mesh2.position.y = this.height/2 - this.height/2;

            const mesh3 = new THREE.Mesh(this.planes[2], this.material);
            mesh3.position.x = this.hole[0] + (this.hole[1] - this.hole[0]) / 2 - this.length/2;
            mesh3.position.y = this.hole[2]/2 - this.height/2;

            const mesh4 = new THREE.Mesh(this.planes[3], this.material);
            mesh4.position.x = this.hole[0] + (this.hole[1] - this.hole[0]) / 2 - this.length/2;
            mesh4.position.y = this.hole[3] + (this.height - this.hole[3]) / 2 - this.height/2;

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