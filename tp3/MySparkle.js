import * as THREE from 'three';

class MySparkle {

    constructor(app, position, size=0.5, inverted=false, color=undefined) {
        this.app = app;
        this.position = position;
        this.size = size;
        this.inverted = inverted;
        this.color = color;

        this.done = false;
        this.dest = [];

        this.vertices = null;
        this.colors = null;
        this.geometry = null;
        this.points = null;

        this.material = new THREE.PointsMaterial({
            size: this.size,
            color: 0xFFFFFF,
            opacity: 1,
            vertexColors: true,
            transparent: false
        });

        this.height = 20;
        this.speed = 60;

        this.#launch();
    }

    #launch() {
        const color = new THREE.Color();

        if (this.color !== undefined) {
            color.setHSL(this.color.h, this.color.s, this.color.l);
        }
        else {
            color.setHSL(THREE.MathUtils.randFloat(0.1, 0.9), 1, 0.9);
        }

        const colors = [color.r, color.g, color.b];

        const x = THREE.MathUtils.randFloat(-2.5, 2.5);
        const y = THREE.MathUtils.randFloat(this.height * 0.9, this.height * 1.1);
        const z = THREE.MathUtils.randFloat(-2.5, 2.5);
        this.dest.push(x, this.inverted ? -y : y, z) ;
        const vertices = [0, 0, 0];
        
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.position.set(...this.position);
        this.points.castShadow = true;
        this.points.receiveShadow = true;
        this.points.frustumCulled = false;
        this.app.scene.add(this.points);
    }

    reset() {
        this.app.scene.remove(this.points);
        this.dest = [];
        this.vertices = null;
        this.colors = null;
        this.geometry = null;
        this.points = null;
    }

    update() {
        // do only if objects exist
        if(this.points && this.geometry)
        {
            const verticesAtribute = this.geometry.getAttribute('position');
            const vertices = verticesAtribute.array;

            // lerp particle positions 
            for(let i = 0; i < vertices.length; i+=3) {
                vertices[i] += (this.dest[i] - vertices[i]) / this.speed;
                vertices[i+1] += (this.dest[i+1] - vertices[i+1]) / this.speed;
                vertices[i+2] += (this.dest[i+2] - vertices[i+2]) / this.speed;
            }

            verticesAtribute.needsUpdate = true;
            
            const needsReset = this.inverted ?
                Math.ceil(vertices[1]) < this.dest[1] * 0.95 :
                Math.ceil(vertices[1]) > this.dest[1] * 0.95;

            if (needsReset) {
                this.reset();
                this.done = true;
            }
        }
    }
}

export { MySparkle };