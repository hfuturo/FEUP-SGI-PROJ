import * as THREE from "three";
import { MyPicker } from "./MyPicker.js";
import { MyBallon } from "./MyBalloon.js";

/**
 * @class MyParkingLot
 * 
 * Represents a parking lot.
 */
class MyParkingLot {
    
    /**
     * Creates an instance of MyParkingLot.
     * 
     * @param {MyApp} app - The application instance.
     * @param {THREE.Vector3} position - The parking lot position.
     * @param {MyBallon[]} balloons - Balloons to display in the parking lot.
     */
    constructor(app, position, balloons) {
        this.app = app;
        this.position = position;
        this.balloons = balloons;
    }

    /**
     * Returns the parking lot position.
     * 
     * @returns {THREE.Vector3}
     */
    getPosition() {
        return this.position;
    }

    /**
     * Sets a new callback.
     * 
     * @param {function(MyBallon)} callback - The new callback.
     */
    setCallback(callback) {
        this.callback = callback;
    }

    /**
     * Displays the parking lot, as well as the ballons.
     * The balloons will be displyed in an angle so it forms a cirlce around the user.
     */
    display() {
        const angle = 2 * Math.PI / this.balloons.length;

        for (let i = 0; i < this.balloons.length; i++) {
            const x = this.position.x + Math.cos(i * angle) * 12.5;
            const z = this.position.z + Math.sin(i * angle) * 12.5;

            this.balloons[i].representation.position.set(x, this.position.y, z);
            this.balloons[i].display();
        }
    }

    /**
     * Selects a balloon from the parking lot.
     * 
     * @param {MyBallon} balloon - Balloon that was selected.
     */
    returnBalloon(balloon) {
        const angle = 2 * Math.PI / this.balloons.length;

        for (let i = 0; i < this.balloons.length; i++) {
            if (this.balloons[i].representation === balloon.representation) {
                const x = this.position.x + Math.cos(i * angle) * 12.5;
                const z = this.position.z + Math.sin(i * angle) * 12.5;

                this.balloons[i].representation.position.set(x, this.position.y, z);
                break;
            }
        }
    }

    /**
     * Creates a MyPicker instance to be able to pick a balloon from the parking lot.
     */
    initPicker() {
        this.picker = new MyPicker(this.app, this.balloons.map((balloon) => balloon.representation), this.pickingHelper.bind(this));
        this.highlight = null;
    }

    /**
     * Highlights a balloon from the parking lot.
     * 
     * @param {MyBallon} object - Balloon that will be highlited when the user clicks on it.
     * @param {boolean} [remove=false] - Removes the highlight from a balloon.
     */
    setHighlight(object, remove=false) {
        if (object.type === "Mesh") {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    if (remove) {
                        material.color.copy(material.userData.originalColor);
                    } else {
                        if (!material.userData.originalColor) {
                            material.userData.originalColor = material.color.clone();
                        }
                        material.color.copy(material.userData.originalColor).lerp(new THREE.Color(0x00ff00), 0.25);
                    }
                });
            } else {
                if (remove) {
                    object.material.color.copy(object.material.userData.originalColor);
                } else {
                    if (!object.material.userData.originalColor) {
                        object.material.userData.originalColor = object.material.color.clone();
                    }
                    object.material.color.copy(object.material.userData.originalColor).lerp(new THREE.Color(0x00ff00), 0.25);
                }
            }
        } else {
            object.children.forEach(child => this.setHighlight(child, remove));
        }
    }

    /**
     * Handles a picking results.
     * 
     * @param {THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]} intersects - Intersections from raycasting.
     */
    pickingHelper(intersects) {
        if (intersects.length > 0) {
            const object = intersects[0].object;
            let parentObj = object;
            while (parentObj.parent.type === "Mesh" || parentObj.parent.type === "Group" || parentObj.parent.type === "LOD") {
                parentObj = parentObj.parent;
            }

            if (this.highlight !== parentObj) {
                if (this.highlight !== null) {
                    this.setHighlight(this.highlight, true);
                }

                this.highlight = parentObj;
                this.setHighlight(this.highlight);
            } else {
                this.setHighlight(this.highlight, true);
                this.picker.dispose();

                if (this.callback) {
                    for (let i = 0; i < this.balloons.length; i++) {
                        if (this.balloons[i].representation === parentObj) {
                            this.callback(this.balloons[i]);
                            break;
                        }
                    }
                }
            }
            
        } else {
            if (this.highlight !== null) {
                this.setHighlight(this.highlight, true);
                this.highlight = null;
            }
        }
    }
}

export { MyParkingLot };