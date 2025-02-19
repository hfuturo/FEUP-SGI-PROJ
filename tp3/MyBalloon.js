import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MyObstacle } from "./MyObstacle.js";
import { MyPowerUp } from "./MyPowerUp.js";
import { MyAnimation } from "./MyAnimation.js";

/**
 * @class MyBalloon
 * 
 * Represents a balloon.
 */
class MyBallon {
    
    /**
     * Creates an instance of MyBalloon.
     * 
     * @param {MyApp} app - The application instance.
     * @param {string} name - The id of the balloon. Despite being a number, it is passed as a string. 
     * @param {Object} wind - Represents the wind layers.
     * @param {Object} balloonTransformations - All information needed to load, resize and create the balloon's collision objects. 
     */
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

    /**
     * Sets a new penalty number.
     * 
     * @param {number} penalty - The new penalty.
     */
    setPenalty(penalty) {
        this.penalty = penalty;
    }

    /**
     * Returns the position of the shadow.
     * 
     * @returns {THREE.Vector3}
     */
    getShadowPosition() {
        return this.shadow.position;
    }

    /**
     * Get the top sphere collision object position and its radius.
     * 
     * @returns {{topPosition: THREE.Vector3, topRadius: number}}
     */
    getTopSpherePosition() {
        const position = new THREE.Vector3();
        this.topSphere.getWorldPosition(position);

        return {
            topPosition: position,
            topRadius: this.collisionTopRadius
        };
    }

    /**
     * Get the bottom sphere collision object position and its radius.
     * 
     * @returns {{bottomPosition: THREE.Vector3, bottomRadius: number}}
     */
    getBottomSpherePosition() {
        const position = new THREE.Vector3();
        this.bottomSphere.getWorldPosition(position);

        return {
            bottomPosition: position,
            bottomRadius: this.collisionBottomRadius
        };
    }

    /**
     * Creates the balloon's collision objects and applies all the transformations needed to them.
     */
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

    /**
     * Loads a balloon and displays it on the screen.
     * The collision objects are also displayed, but they are invisible.
     */
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

    /**
     * Moves the balloon upwards by creating an animation.
     * If the balloon is freezed or in the highest layer or an animation is playing, the balloon will not be moved.
     * 
     * @returns {boolean} Returns true if the balloon will move or false otherwise.
     */
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

    /**
     * Moves the balloon downwards by creating an animation.
     * If the balloon is freezed or in the lowest layer or an animation is playing, the balloon will not be moved.
     * 
     * @returns {boolean} Returns true if the balloon will move or false otherwise.
     */
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

    /**
     * Updates the balloon's position.
     * If the balloon is freezed, the balloon will not be updated.
     * 
     * @returns {void}
     */
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

    /**
     * Handles a collision with an object. 
     * The object will be tagged so the balloon does not collides with it again as soon as it touches it.
     * 
     * @param {(MyObstacle|MyBallon|MyPowerUp)} object - The object that collided with the balloon.
     */
    handleCollision(object) {
        if (object instanceof MyObstacle || object instanceof MyBallon) {
            this.vouchers === 0 ? this.freeze() : this.vouchers--;
        }
        else if (object instanceof MyPowerUp) {
            this.vouchers++;
        }

        this.#tagObject(object);
    }

    /**
     * Checks if an object collided with the balloon.
     * 
     * @param {(MyObstacle|MyBallon|MyPowerUp)} object - Object to check the collision
     * 
     * @returns {boolean} - Returns true of there is a collision. Otherwise returns false.
     */
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

    /**
     * Checks if an object collided with the balloon recently.
     * 
     * @param {(MyObstacle|MyBallon|MyPowerUp)} object - Object to check.
     * 
     * @returns {boolean} True if the object collided recently. False otherwise.
     */
    collidedWith(object) {
        return this.collidedObjects.includes(object);
    }

    /**
     * Checks if there is a sphere-sphere collision.
     * 
     * @param {THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>} thisSphere - Balloon's sphere.
     * @param {number} thisRadius - The radius of the thisSphere parameter.
     * @param {(THREE.Vector3|number[])} objPosition - The object's sphere position.
     * @param {number} objRadius - The radius of the objPosition sphere.
     * 
     * @returns {boolean} True if there is a collision. False otherwise.
     */
    #checkSphereCollision(thisSphere, thisRadius, objPosition, objRadius) {
        const position = new THREE.Vector3();
        thisSphere.getWorldPosition(position);

        const diffX = Math.pow((Array.isArray(objPosition) ? objPosition[0] : objPosition.x) - position.x, 2);
        const diffY = Math.pow((Array.isArray(objPosition) ? objPosition[1] : objPosition.y) - position.y, 2);
        const diffZ = Math.pow((Array.isArray(objPosition) ? objPosition[2] : objPosition.z) - position.z, 2);

        return Math.sqrt(diffX + diffY + diffZ) <= (objRadius + thisRadius);
    }

    /**
     * Checks if there is a sphere-cube collision.
     * 
     * @param {THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>} thisSphere - Balloon's sphere.
     * @param {number} radius - The radius of the sphere parameter.
     * @param {number[]} objPosition - The position of the object's cube.
     * @param {number} objWidth - The width of the cube.
     * @param {number} objHeight - The height of the cube.
     * @param {number} objDepth - The depth of the cube.
     * 
     * @returns True if there is a collision. False otherwise.
     */
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
    
    /**
     * Gets the balloon position.
     * 
     * @returns {THREE.Vector3}
     */
    getPosition() {
        return this.representation.position;
    }

    /**
     * Updates both the balloon and the shadow position.
     * 
     * @param {THREE.Vector3} position - New position.
     */
    setPosition(position) {
        this.representation.position.set(position.x, position.y, position.z);
        this.shadow.position.set(position.x, this.shadowY, position.z);
    }

    /**
     * Returns the number of vouchers this balloon has.
     * 
     * @returns {number}
     */
    getVouchers() {
        return this.vouchers;
    }

    /**
     * Freezes the balloon and unfreezes it after a penalty has been applied.
     */
    freeze() {
        this.freezed = true;

        // releases balloon after 2 seconds penalty
        setTimeout(() => this.freezed = false, this.penalty);
    }

    /**
     * Freezes the balloon and replces it in the closest track point.
     * The balloon will be unfreezed after a penalty is applied.
     * 
     * @param {THREE.Vector3} point - Closest track point.
     * @returns {void}
     */
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

    /**
     * Tags an object that just collided with the balloon.
     * This is used so, when the balloon unfreezes, there is a gap so the balloon can move away from the obstacle
     * 
     * @param {(MyObstacle|MyPowerUp|MyBallon)} object - Object that just collided with the balloon.
     */
    #tagObject(object) {
        this.collidedObjects.push(object);
    
        // removes object after 4s (2s penalty + 2s so ballon is not affected by the same obstacle twice in a row)
        setTimeout(() => this.#removeTaggedObject(object), 2000 + this.penalty);
    }
    
    /**
     * Removes an object from the tagged objects.
     * 
     * @param {(MyObstacle|MyPowerUp|MyBallon)} object - Object to remove.
     */
    #removeTaggedObject(object) {
        this.collidedObjects = this.collidedObjects.filter((obj) => obj !== object);
    }

    /**
     * Animates a balloon so that it will follow a route and complete the track.
     * 
     * @param {THREE.Vector3} route - Route that has the points the balloon needs to follow.
     * @param {number} lapTime - Time the balloon will take to finish a lap.
     * @param {number} numLaps - Number of laps the balloon needs to finish.
     */
    animateAutonomous(route, lapTime, numLaps) {
        let lapDistance = Math.sqrt(Math.pow(route[0].x - this.representation.position.x, 2) + Math.pow(route[0].z - this.representation.position.z, 2));
        for (let i = 1; i < route.length; i++) {
            lapDistance += Math.sqrt(Math.pow(route[i].x - route[i-1].x, 2) + Math.pow(route[i].z - route[i-1].z, 2));
        }

        const timePerUnit = lapTime / lapDistance;
        const positions = [...this.representation.position], times = [0], shadowPositions = [...this.shadow.position];
        for (let lap = 0; lap < numLaps; lap++) {
            route.forEach((point) => {
                const distance = Math.sqrt(Math.pow(point.x - positions.at(-3), 2) + Math.pow(point.z - positions.at(-1), 2));
                const time = distance * timePerUnit;
                times.push(times.at(-1) + time);
                positions.push(point.x, point.y + 2, point.z);
                shadowPositions.push(point.x, this.shadowY, point.z);
            });
        }

        this.balloonAnimation.createAnimation(times, positions);
        this.shadowAnimation.createAnimation(times, shadowPositions);
    }
}

export { MyBallon };

