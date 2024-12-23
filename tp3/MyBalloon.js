import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { MyObstacle } from "./MyObstacle.js";
import { MyPowerUp } from "./MyPowerUp.js";


class MyBallon {

    wind = {
        north: 5,
        south: 5,
        east: 5,
        west: 5
    }
    
    constructor(app, boxLength, sphereRadius) {
        this.app = app;
        this.boxLength = boxLength;
        this.sphereRadius = sphereRadius;

        this.height = 0;
        this.group = new THREE.Group();
        
        this.clock = new THREE.Clock();
        this.mixer = new THREE.AnimationMixer(this.group);
        this.animationPlaying = false;

        this.balloonScale = 0.25;

        this.#initCollisionObjects();
    }

    #initCollisionObjects() {
        // set opacity to 1 to see geometries
        this.collisionMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: true, opacity: 0 });

        // geometries to detect collisions
        this.collisionTopRadius = 3;
        this.topSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.collisionTopRadius),
            this.collisionMaterial
        );

        this.collisionMiddleRadius = 1.25;
        this.middleSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.collisionMiddleRadius),
            this.collisionMaterial
        );

        this.collisionMiddleBottomRadius = 0.45;
        this.middleBottomSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.collisionMiddleBottomRadius),
            this.collisionMaterial
        );

        this.collisionBottomRadius = 0.275;
        this.bottomSphere = new THREE.Mesh(
            new THREE.SphereGeometry(this.collisionBottomRadius),
            this.collisionMaterial
        );
    }

    display() {
        const objLoader = new OBJLoader();
        const mtlLoader = new MTLLoader();

        objLoader.load(
            "models/balloon1/Air_Balloon.obj",
            (ballon) => {
                ballon.scale.set(this.balloonScale, this.balloonScale, this.balloonScale);
                this.group.add(ballon);
            },
            (obj) => console.log(`${obj.loaded / obj.total * 100}% loaded`),
            (error) => console.error(`Error loading ballon object: ${error}`)
        );
        
        mtlLoader.load(
            "models/balloon1/Air_Balloon.mtl",
            (model) => objLoader.setMaterials(model),
            (mtl) => console.log(`${mtl.loaded / mtl.total * 100}% loaded`),
            (error) => console.error(`Error loading ballon material: ${error}`)
        );

        this.topSphere.position.set(0, 5.5, 0);
        this.middleSphere.position.set(0, 3, 0);
        this.middleBottomSphere.position.set(0, 1.5, 0);
        this.bottomSphere.position.set(0, 0.325, 0);
        this.group.add(this.topSphere);
        this.group.add(this.middleSphere);
        this.group.add(this.middleBottomSphere);
        this.group.add(this.bottomSphere);
        this.app.scene.add(this.group);
    }

    up() {
        if (this.height === 4 || this.animationPlaying) return false;

        const yDisplacement = (this.boxLength + this.sphereRadius*2)*1.1/10;
        // 0 -> max wind in current height
        // 0.5 -> half wind in current height and half wind in new height
        // 1 -> max wind in new height
        const times = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
        const positions = [...this.group.position]

        // multiply offsets by 6 because we are only setting 10 positions but we have 60 fps
        for (let i = 1; i < 11; i++) {
            if (this.height === 0) {
                const z = positions.at(-1) - this.wind.north/50 * i/10 * 6;
                positions.push(positions[0], positions[1] + yDisplacement*i, z)
            }
            else if (this.height === 1) {
                const z = positions.at(-1) + this.wind.south/50 * i/10 * 6 - this.wind.north/50 * (1 - i/10) * 6;
                positions.push(positions[0], positions[1] + yDisplacement*i, z)
            }
            else if (this.height === 2) {
                const z = positions.at(-1) + this.wind.south/50 * (1 - i/10) * 6;
                const x = positions.at(-3) + this.wind.east/50 * i/10 * 6;
                positions.push(x, positions[1] + yDisplacement*i, z)
            }
            else if (this.height === 3) {
                const x = positions.at(-3) + this.wind.east/50 * (1 - i/10) * 6 - this.wind.west/50 * i/10 * 6;
                positions.push(x, positions[1] + yDisplacement*i, positions[2])
            }
        }

        this.createAnimation(times, positions);
        this.height++;

        return true;
    }

    down() {
        if (this.height === 0 || this.animationPlaying) return false;
        
        const yDisplacement = (this.boxLength + this.sphereRadius*2)*1.1/10;
        // 0 -> max wind in current height
        // 0.5 -> half wind in current height and half wind in new height
        // 1 -> max wind in new height
        const times = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
        const positions = [...this.group.position]

        // multiply offsets by 6 because we are only setting 10 positions but we have 60 fps
        for (let i = 1; i < 11; i++) {
            if (this.height === 1) {
                const z = positions.at(-1) - this.wind.north/50 * (1 - i/10) * 6;
                positions.push(positions[0], positions[1] - yDisplacement*i, z)
            }
            else if (this.height === 2) {
                const z = positions.at(-1) + this.wind.south/50 * (1 - i/10) * 6 - this.wind.north/50 * i/10 * 6;
                positions.push(positions[0], positions[1] - yDisplacement*i, z)
            }
            else if (this.height === 3) {
                const z = positions.at(-1) + this.wind.south/50 * i/10 * 6;
                const x = positions.at(-3) + this.wind.east/50 * (1 - i/10) * 6;
                positions.push(x, positions[1] - yDisplacement*i, z)
            }
            else if (this.height === 4) {
                const x = positions.at(-3) + this.wind.east/50 * i/10 * 6 - this.wind.west/50 * (1 - i/10) * 6;
                positions.push(x, positions[1] - yDisplacement*i, positions[2])
            }
        }

        this.createAnimation(times, positions);
        this.height--;

        return true;
    }

    update() {
        if (this.height === 1)
            this.group.position.z -= this.wind.north/50;
        else if (this.height === 2)
            this.group.position.z += this.wind.south/50;
        else if (this.height === 3)
            this.group.position.x += this.wind.east/50;
        else if (this.height === 4)
            this.group.position.x -= this.wind.west/50;

        if (this.mixer)
            this.mixer.update(this.clock.getDelta())
    }

    createAnimation(times, values) {
        const positionKF = new THREE.VectorKeyframeTrack('.position', times, values, THREE.InterpolateSmooth)

        const positionClip = new THREE.AnimationClip('positionAnimation', -1, [positionKF])

        const positionAction = this.mixer.clipAction(positionClip)
        positionAction.setLoop(THREE.LoopOnce)
        positionAction.clampWhenFinished = true
        this.animationPlaying = true;

        const onAnimationFinished = () => {
            this.animationPlaying = false;
            this.mixer.stopAllAction();
            this.group.position.set(values.at(-3), values.at(-2), values.at(-1));
            this.mixer.removeEventListener('finished', onAnimationFinished);
        };

        this.mixer.addEventListener('finished', onAnimationFinished);

        positionAction.play()
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

        return false;
    }

    #checkSphereCollision(thisSphere, thisRadius, objPosition, objRadius) {
        const position = new THREE.Vector3();
        thisSphere.getWorldPosition(position);

        const diffX = Math.pow(objPosition[0] - position.x, 2);
        const diffY = Math.pow(objPosition[1] - position.y, 2);
        const diffZ = Math.pow(objPosition[2] - position.z, 2);

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
        return this.group.position;
    }
}

export { MyBallon };

