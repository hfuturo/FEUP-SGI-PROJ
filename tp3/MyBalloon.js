import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MyObstacle } from "./MyObstacle.js";
import { MyPowerUp } from "./MyPowerUp.js";
import { MyAnimation } from "./MyAnimation.js";


class MyBallon {
    
    constructor(app, name, wind, balloonTransformations) {
        this.app = app;
        this.name = name;
        this.wind = wind;
        this.balloonTransformations = balloonTransformations;

        this.height = 0;
        this.representation = new THREE.LOD();

        this.group = new THREE.Group();
        const billboard = new THREE.Sprite(new THREE.SpriteMaterial({ 
            map: new THREE.TextureLoader().load(`textures/balloons/${this.name}.png`),
            color: 0xffffff
        }));
        billboard.scale.set(9, 9, 9);
        billboard.position.y = 4;

        this.representation.addLevel(this.group, 0);
        this.representation.addLevel(billboard, 40);

        this.ySize = 9;
        this.basketHeight = this.balloonTransformations.basket;
        
        this.shadowY = 0.3;
        this.shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(0.4, 0.4),
            new THREE.MeshBasicMaterial({ color: 0x000000})
        );
        this.shadow.rotation.set(-90 * Math.PI / 180, 0, 0);

        this.animationPlaying = false;
        this.balloonAnimation = new MyAnimation(this.representation);
        this.shadowAnimation = new MyAnimation(this.shadow);

        this.vouchers = 0;
        this.freezed = false;

        // used to store obstacles temporarily that collided with balloon
        this.collidedObjects = [];

        this.penalty = 2000;

        this.#initCollisionObjects();
    }

    setPenalty(penalty) {
        this.penalty = penalty;
    }

    getShadowPosition() {
        return this.shadow.position;
    }

    getTopSpherePosition() {
        const position = new THREE.Vector3();
        this.topSphere.getWorldPosition(position);

        return {
            topPosition: position,
            topRadius: this.collisionTopRadius
        };
    }

    getBottomSpherePosition() {
        const position = new THREE.Vector3();
        this.bottomSphere.getWorldPosition(position);

        return {
            bottomPosition: position,
            bottomRadius: this.collisionBottomRadius
        };
    }

    #initCollisionObjects() {
        // set opacity to 1 to see geometries
        this.collisionMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: true, opacity: 0 });

        // geometries to detect collisions
        this.collisionTopRadius = this.balloonTransformations.topSphere.radius;
        this.topSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.collisionTopRadius),
            this.collisionMaterial
        );
        this.topSphere.position.set(...this.balloonTransformations.topSphere.position);

        this.collisionMiddleRadius = this.balloonTransformations.middleSphere.radius;
        this.middleSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.collisionMiddleRadius),
            this.collisionMaterial
        );
        this.middleSphere.position.set(...this.balloonTransformations.middleSphere.position);

        this.collisionMiddleBottomRadius = this.balloonTransformations.middleBottomSphere.radius;
        this.middleBottomSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.collisionMiddleBottomRadius),
            this.collisionMaterial
        );
        this.middleBottomSphere.position.set(...this.balloonTransformations.middleBottomSphere.position);

        this.collisionBottomRadius = this.balloonTransformations.bottomSphere.radius;
        this.bottomSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.collisionBottomRadius),
            this.collisionMaterial
        );
        this.bottomSphere.position.set(...this.balloonTransformations.bottomSphere.position);
    }

    display() {                
        if (this.balloonTransformations.type === 'obj') {
            const objLoader = new OBJLoader();
            const mtlLoader = new MTLLoader();

            mtlLoader.load(
                `models/balloons/balloon${this.name}/balloon.mtl`,
                (model) => objLoader.setMaterials(model),
                (mtl) => console.log(`${mtl.loaded / mtl.total * 100}% loaded`),
                (error) => console.error(`Error loading ballon material: ${error}`)
            );

            objLoader.load(
                `models/balloons/balloon${this.name}/balloon.obj`,
                (balloon) => {
                    balloon.position.set(...this.balloonTransformations.position);
                    balloon.scale.set(...this.balloonTransformations.scale);
                    balloon.rotation.set(...this.balloonTransformations.rotation.map((angle => angle * Math.PI / 180)));
                    this.group.add(balloon);
                },
                (obj) => console.log(`${obj.loaded / obj.total * 100}% loaded`),
                (error) => console.error(`Error loading ballon object: ${error}`)
            );
        }
        else {
            const fbxLoader = new FBXLoader();

            fbxLoader.load(
                `models/balloons/balloon${this.name}/balloon.fbx`,
                (balloon) => {
                    balloon.position.set(...this.balloonTransformations.position);
                    balloon.scale.set(...this.balloonTransformations.scale);
                    balloon.rotation.set(...this.balloonTransformations.rotation.map((angle => angle * Math.PI / 180)));

                    if ('textures' in this.balloonTransformations) {
                        const textureLoader = new THREE.TextureLoader();
                        const textures = this.balloonTransformations["textures"].map((texture) => textureLoader.load(texture));

                        balloon.traverse((child) => {
                            if (child.isMesh) {
                                if (Array.isArray(child.material)) {
                                    child.material.forEach((mat, index) => {
                                        mat.map = textures[index % textures.length];
                                        mat.needsUpdate = true;
                                    });
                                }
                                else {
                                    child.material.map = textures[0];
                                    child.material.needsUpdate = true;
                                }
                            }
                        });
                    }

                    this.group.add(balloon);
                },
                (obj) => console.log(`${obj.loaded / obj.total * 100}% loaded`),
                (error) => console.error(`Error loading ballon object: ${error}`)
            );
        }

        this.group.add(this.topSphere);
        this.group.add(this.middleSphere);
        this.group.add(this.middleBottomSphere);
        this.group.add(this.bottomSphere);
        this.app.scene.add(this.representation);
        this.app.scene.add(this.shadow);
    }

    up() {
        if (this.freezed || this.height === 4 || this.balloonAnimation.isPlaying() || this.shadowAnimation.isPlaying()) return false;

        const yDisplacement = this.ySize/10;
        // 0 -> max wind in current height
        // 0.5 -> half wind in current height and half wind in new height
        // 1 -> max wind in new height
        const times = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
        const balloonPositions = [...this.representation.position];
        const shadowPositions = [...this.shadow.position];

        // multiply offsets by 6 because we are only setting 10 positions but we have 60 fps
        for (let i = 1; i < 11; i++) {
            if (this.height === 0) {
                const z = balloonPositions.at(-1) - this.wind.north/50 * i/10 * 6;
                balloonPositions.push(balloonPositions[0], balloonPositions[1] + yDisplacement*i, z);
                shadowPositions.push(balloonPositions[0], this.shadowY, z);
            }
            else if (this.height === 1) {
                const z = balloonPositions.at(-1) + this.wind.south/50 * i/10 * 6 - this.wind.north/50 * (1 - i/10) * 6;
                balloonPositions.push(balloonPositions[0], balloonPositions[1] + yDisplacement*i, z);
                shadowPositions.push(balloonPositions[0], this.shadowY, z);

            }
            else if (this.height === 2) {
                const z = balloonPositions.at(-1) + this.wind.south/50 * (1 - i/10) * 6;
                const x = balloonPositions.at(-3) + this.wind.east/50 * i/10 * 6;
                balloonPositions.push(x, balloonPositions[1] + yDisplacement*i, z);
                shadowPositions.push(x, this.shadowY, z);
            }
            else if (this.height === 3) {
                const x = balloonPositions.at(-3) + this.wind.east/50 * (1 - i/10) * 6 - this.wind.west/50 * i/10 * 6;
                balloonPositions.push(x, balloonPositions[1] + yDisplacement*i, balloonPositions[2]);
                shadowPositions.push(x, this.shadowY, balloonPositions[2]);
            }
        }

        this.balloonAnimation.createAnimation(times, balloonPositions);
        this.shadowAnimation.createAnimation(times, shadowPositions);
        this.height++;

        return true;
    }

    down() {
        if (this.freezed || this.height === 0 || this.balloonAnimation.isPlaying() || this.shadowAnimation.isPlaying()) return false;
        
        const yDisplacement = this.ySize/10;
        // 0 -> max wind in current height
        // 0.5 -> half wind in current height and half wind in new height
        // 1 -> max wind in new height
        const times = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
        const balloonPositions = [...this.representation.position];
        const shadowPositions = [...this.shadow.position];

        // multiply offsets by 6 because we are only setting 10 positions but we have 60 fps
        for (let i = 1; i < 11; i++) {
            if (this.height === 1) {
                const z = balloonPositions.at(-1) - this.wind.north/50 * (1 - i/10) * 6;
                balloonPositions.push(balloonPositions[0], balloonPositions[1] - yDisplacement*i, z);
                shadowPositions.push(balloonPositions[0], this.shadowY, z);
            }
            else if (this.height === 2) {
                const z = balloonPositions.at(-1) + this.wind.south/50 * (1 - i/10) * 6 - this.wind.north/50 * i/10 * 6;
                balloonPositions.push(balloonPositions[0], balloonPositions[1] - yDisplacement*i, z);
                shadowPositions.push(balloonPositions[0], this.shadowY, z);
            }
            else if (this.height === 3) {
                const z = balloonPositions.at(-1) + this.wind.south/50 * i/10 * 6;
                const x = balloonPositions.at(-3) + this.wind.east/50 * (1 - i/10) * 6;
                balloonPositions.push(x, balloonPositions[1] - yDisplacement*i, z);
                shadowPositions.push(x, this.shadowY, z);
            }
            else if (this.height === 4) {
                const x = balloonPositions.at(-3) + this.wind.east/50 * i/10 * 6 - this.wind.west/50 * (1 - i/10) * 6;
                balloonPositions.push(x, balloonPositions[1] - yDisplacement*i, balloonPositions[2]);
                shadowPositions.push(x, this.shadowY, balloonPositions[2]);
            }
        }

        this.balloonAnimation.createAnimation(times, balloonPositions);
        this.shadowAnimation.createAnimation(times, shadowPositions);
        this.height--;

        return true;
    }

    update() {
        if (this.freezed) return;

        if (this.height === 1) {
            this.representation.position.z -= this.wind.north/50;
            this.shadow.position.z -= this.wind.north/50;
        }
        else if (this.height === 2) {
            this.representation.position.z += this.wind.south/50;
            this.shadow.position.z += this.wind.south/50;
        }
        else if (this.height === 3) {
            this.representation.position.x += this.wind.east/50;
            this.shadow.position.x += this.wind.east/50;
        }
        else if (this.height === 4) {
            this.representation.position.x -= this.wind.west/50;
            this.shadow.position.x -= this.wind.west/50;
        }

        this.balloonAnimation.update();
        this.shadowAnimation.update();
    }

    handleCollision(object) {
        if (object instanceof MyObstacle || object instanceof MyBallon) {
            this.vouchers === 0 ? this.freeze() : this.vouchers--;
        }
        else if (object instanceof MyPowerUp) {
            this.vouchers++;
        }

        this.#tagObject(object);
    }

    collides(object) {

        const objPosition = object.getPosition();

        if (object instanceof MyObstacle) {
            const objRadius = object.getRadius();

            if (this.#checkSphereCollision(this.topSphere, this.collisionTopRadius, objPosition, objRadius))
                return true;
    
            if (this.#checkSphereCollision(this.middleSphere, this.collisionMiddleRadius, objPosition, objRadius))
                return true;
    
            if (this.#checkSphereCollision(this.middleBottomSphere, this.collisionMiddleBottomRadius, objPosition, objRadius))
                return true;
    
            if (this.#checkSphereCollision(this.bottomSphere, this.collisionBottomRadius, objPosition, objRadius))
                return true;
        }
        else if (object instanceof MyPowerUp) {
            const objWidth = object.getWidth() / 2;
            const objHeight = object.getHeight() / 2;
            const objDepth = object.getDepth() / 2;

            if (this.#checkBoxCollision(this.topSphere, this.collisionTopRadius, objPosition, objWidth, objHeight, objDepth))
                return true;

            if (this.#checkBoxCollision(this.middleSphere, this.collisionMiddleRadius, objPosition, objWidth, objHeight, objDepth))
                return true;

            if (this.#checkBoxCollision(this.middleBottomSphere, this.collisionMiddleBottomRadius, objPosition, objWidth, objHeight, objDepth))
                return true;

            if (this.#checkBoxCollision(this.bottomSphere, this.collisionBottomRadius, objPosition, objWidth, objHeight, objDepth))
                return true;
        }
        else if (object instanceof MyBallon) {
            const {topPosition, topRadius} = object.getTopSpherePosition();
            const {bottomPosition, bottomRadius} = object.getBottomSpherePosition();

            if (this.#checkSphereCollision(this.topSphere, this.collisionTopRadius, topPosition, topRadius))
                return true;

            if (this.#checkSphereCollision(this.bottomSphere, this.collisionBottomRadius, topPosition, topRadius))
                return true;

            if (this.#checkSphereCollision(this.topSphere, this.collisionTopRadius, bottomPosition, bottomRadius))
                return true;

            if (this.#checkSphereCollision(this.bottomSphere, this.collisionBottomRadius, bottomPosition, bottomRadius))
                return true;
        }

        return false;
    }

    collidedWith(object) {
        return this.collidedObjects.includes(object);
    }

    #checkSphereCollision(thisSphere, thisRadius, objPosition, objRadius) {
        const position = new THREE.Vector3();
        thisSphere.getWorldPosition(position);

        const diffX = Math.pow((Array.isArray(objPosition) ? objPosition[0] : objPosition.x) - position.x, 2);
        const diffY = Math.pow((Array.isArray(objPosition) ? objPosition[1] : objPosition.y) - position.y, 2);
        const diffZ = Math.pow((Array.isArray(objPosition) ? objPosition[2] : objPosition.z) - position.z, 2);

        return Math.sqrt(diffX + diffY + diffZ) <= (objRadius + thisRadius);
    }

    #checkBoxCollision(sphere, radius, objPosition, objWidth, objHeight, objDepth) {
        const position = new THREE.Vector3();
        sphere.getWorldPosition(position);

        const diffX = Math.abs(position.x - objPosition[0]);
        const diffY = Math.abs(position.y - objPosition[1]);
        const diffZ = Math.abs(position.z - objPosition[2]);

        if (diffX >= (objWidth + radius)) return false;
        if (diffY >= (objHeight + radius)) return false;
        if (diffZ >= (objDepth + radius)) return false;

        if (diffX < objWidth) return true;
        if (diffY < objHeight) return true;
        if (diffZ < objDepth) return true;

        const cornerDistance = Math.sqrt(
                                    Math.pow(diffX - objWidth, 2) +
                                    Math.pow(diffY - objHeight, 2) +
                                    Math.pow(diffZ - objDepth, 2)
                                );   

        return cornerDistance < (radius * radius);
    }
    
    getPosition() {
        return this.representation.position;
    }

    setPosition(position) {
        this.representation.position.set(position.x, position.y, position.z);
        this.shadow.position.set(position.x, this.shadowY, position.z);
    }

    getVouchers() {
        return this.vouchers;
    }

    freeze() {
        this.freezed = true;

        // releases balloon after 2 seconds penalty
        setTimeout(() => this.freezed = false, this.penalty);
    }

    freezeAndReplace(point) {
        if (this.balloonAnimation.isPlaying()) {
            this.balloonAnimation.stopAnimation();
            this.shadowAnimation.stopAnimation();
        }

        this.shadow.position.set(point.x, this.shadowY, point.z);
        this.representation.position.set(point.x, this.representation.position.y, point.z);
        
        if (this.vouchers > 0) {
            this.vouchers--;
            return;
        }
        else {
            this.freezed = true;
        }
        

        // releases balloon after 2 seconds
        setTimeout(() => this.freezed = false, this.penalty);
    }   

    #tagObject(object) {
        this.collidedObjects.push(object);
    
        // removes object after 4s (2s penalty + 2s so ballon is not affected by the same obstacle twice in a row)
        setTimeout(() => this.#removeTaggedObject(object), 2000 + this.penalty);
    }
    
    #removeTaggedObject(object) {
        this.collidedObjects = this.collidedObjects.filter((obj) => obj !== object);
    }
}

export { MyBallon };

