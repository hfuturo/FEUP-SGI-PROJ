import * as THREE from 'three';

class MyPolygon extends THREE.BufferGeometry {

    constructor(radius, stacks, slices, color_c=0, color_p=0) {
        super();
        this.radius = radius;
        this.stacks = stacks;
        this.slices = slices;
        this.color_c = color_c;
        this.color_p = color_p;

        this.initBuffers();
    }

    initBuffers() {
        const positions = [];
        const normals = [];
        const indices = [];
        const colors = [];
    
        const sliceAngle = 2 * Math.PI / this.slices;
        const radiusStep = this.radius / this.stacks;
    
        for (let j = 0; j <= this.slices; ++j) {
            const angle = j * sliceAngle;
            const cosAngle = Math.cos(angle);
            const sinAngle = Math.sin(angle);
    
            for (let i = 0; i <= this.stacks; ++i) {
                const currentRadius = i * radiusStep;
    
                const x = currentRadius * cosAngle;
                const y = currentRadius * sinAngle;
    
                positions.push(x, y, 0);
                normals.push(0, 0, 1);

                const color = new THREE.Color().lerpColors(this.color_c, this.color_p, i / this.stacks);
                colors.push(color.r, color.g, color.b);
            }
        }
    
        for (let j = 0; j < this.slices; ++j) {
            for (let i = 0; i < this.stacks; ++i) {
                const first = j * (this.stacks + 1) + i;
                const second = ((j + 1) % (this.slices + 1)) * (this.stacks + 1) + i;
    
                indices.push(first, first + 1, second + 1);
                indices.push(first, second + 1, second);
            }
        }
    
        this.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
        this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    }
}

export { MyPolygon };