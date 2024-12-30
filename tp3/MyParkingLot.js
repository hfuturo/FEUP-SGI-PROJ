import * as THREE from "three";
import { MyPicker } from "./MyPicker.js";

class MyParkingLot {
    constructor(app, position, balloons) {
        this.app = app;
        this.position = position;
        this.balloons = balloons;
    }

    setCallback(callback) {
        this.callback = callback;
    }

    display() {
        const angle = 2 * Math.PI / this.balloons.length;

        for (let i = 0; i < this.balloons.length; i++) {
            const x = this.position.x + Math.cos(i * angle) * 12.5;
            const z = this.position.z + Math.sin(i * angle) * 12.5;

            this.balloons[i].group.position.set(x, this.position.y, z);
            this.balloons[i].display();
        }
    }

    returnBalloon(balloon) {
        const angle = 2 * Math.PI / this.balloons.length;

        for (let i = 0; i < this.balloons.length; i++) {
            if (this.balloons[i].group === balloon.group) {
                const x = this.position.x + Math.cos(i * angle) * 12.5;
                const z = this.position.z + Math.sin(i * angle) * 12.5;

                this.balloons[i].group.position.set(x, this.position.y, z);
                break;
            }
        }
    }

    initPicker() {
        this.picker = new MyPicker(this.app, this.balloons.map((balloon) => balloon.group), this.pickingHelper.bind(this));
        this.highlight = null;
    }

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

    pickingHelper(intersects) {
        if (intersects.length > 0) {
            const object = intersects[0].object;
            let parentObj = object;
            while (parentObj.parent.type === "Mesh" || parentObj.parent.type === "Group") {
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
                        if (this.balloons[i].group === parentObj) {
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