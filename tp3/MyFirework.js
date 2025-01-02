import * as THREE from 'three';

class MyFirework {

    constructor(app, position, size=0.5) {
        this.app = app;
        this.position = position;
        this.size = size;

        this.color = this.#getRandomColor();

        this.done = false;
        this.dest = [];
        
        this.vertices = [];
        this.colors = [];
        this.geometry = null;
        this.points = null;
        
        this.material = new THREE.PointsMaterial({
            size: this.size,
            color: 0xffffff,
            opacity: 1,
            vertexColors: true,
            transparent: true
        });
        
        this.height = 70;
        this.speed = 60;

        this.#launch();
    }

    #getRandomColor() {
        const color = new THREE.Color();
        color.setHSL(THREE.MathUtils.randFloat(0.1, 0.9), THREE.MathUtils.randFloat(0.5, 0.9), THREE.MathUtils.randFloat(0.5, 0.9));
        return color;
    }

    #launch() {
        const colors = [this.color.r, this.color.g, this.color.b];

        const x = THREE.MathUtils.randFloat(-5, 5);
        const y = THREE.MathUtils.randFloat(this.height * 0.9, this.height * 1.1);
        const z = THREE.MathUtils.randFloat(-5, 5);
        this.dest.push(x, y, z);
        const vertices = [0, 0, 0];
        
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.castShadow = true;
        this.points.receiveShadow = true;
        this.points.frustumCulled = false;
        this.points.position.set(...this.position);
        this.app.scene.add(this.points);
    }

    explode(origin, n, rangeBegin, rangeEnd) {
        let mixedColors = false;
        if (Math.random() < 0.05) {
            mixedColors = true;
        }
        
        const range = rangeEnd - rangeBegin;
        
        for (let i = 0; i < n; i++) {
            let colors;
            
            if (mixedColors) {
                const color = this.#getRandomColor();
                colors = [color.r, color.g, color.b];
            }
            else {
                colors = [this.color.r, this.color.g, this.color.b];
            }
    
            const x = THREE.MathUtils.randFloat(-range, range);
            const y = THREE.MathUtils.randFloat(-range, range);
            const z = THREE.MathUtils.randFloat(-range, range);
            
            this.dest.push(origin[0] + x, origin[1] + y, origin[2] + z);
            this.vertices.push(...origin);
            this.colors.push(...colors);
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
    }

    reset() {
        this.app.scene.remove(this.points);
        this.dest = [];
        this.vertices = [];
        this.colors = []; 
        this.geometry = null;
        this.points = null;
    }

    update() {
        // do only if objects exist
        if(this.points && this.geometry)
        {
            const verticesAtribute = this.geometry.getAttribute('position');
            const vertices = verticesAtribute.array;
            const count = verticesAtribute.count;

            // lerp particle positions 
            for(let i = 0; i < vertices.length; i+=3) {
                vertices[i] += (this.dest[i] - vertices[i]) / this.speed;
                vertices[i+1] += (this.dest[i+1] - vertices[i+1]) / this.speed;
                vertices[i+2] += (this.dest[i+2] - vertices[i+2]) / this.speed;
            }

            verticesAtribute.needsUpdate = true;
            
            // only one particle?
            if(count === 1) {
                //is YY coordinate higher close to destination YY? 
                if(Math.ceil(vertices[1]) > (this.dest[1] * 0.95)) {
                    // add n particles departing from the location at (vertices[0], vertices[1], vertices[2])
                    this.explode(vertices, 80, this.height * 0.05, this.height * 0.5);
                    return;
                }
            }
            
            // are there a lot of particles (aka already exploded)?
            if(count > 1) {
                // fade out exploded particles 
                this.material.opacity -= 0.015;
                this.material.needsUpdate = true;
            }
            
            // remove, reset and stop animating 
            if(this.material.opacity <= 0) {
                this.reset();
                this.done = true;
                return;
            }
        }
    }
}

export { MyFirework };