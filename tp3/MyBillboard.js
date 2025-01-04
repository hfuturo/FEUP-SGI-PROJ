import * as THREE from 'three';
import { MyAnimation } from './MyAnimation.js';

/**
 * @class MyBillboard
 * Represents a billboard/outdoor display. Contains several methods that allow addition of elements and interaction with the billboard.
 */
class MyBillboard {
    /**
     * Creates an instance of MyBillboard.
     * 
     * @constructor
     * @param {Object} app - The application instance.
     * @param {Object} position - The position of the billboard.
     * @param {number} depth - The depth of the billboard.
     * @param {Object} [rotation] - The rotation of the billboard.
     */
    constructor(app, position, depth, rotation) {
        this.app = app;
        this.position = position;
        this.depth = depth;
        this.rotation = rotation ? rotation.y : 0;

        this.textObjs = [];
        this.pictureObjs = [];
        this.buttonObjs = [];
    }

    static font = new THREE.TextureLoader().load('textures/font.png');

    /**
     * Starts a timer and displays it on the screen.
     * 
     * @param {number} x - The x-coordinate for the timer display, relative to the billboard's position
     * @param {number} y - The y-coordinate for the timer display, relative to the billboard's position
     * @param {number} size - The font size of the timer display.
     */
    startTimer(x, y, size) {
        this.startTime = Date.now();
        this.lastTime = this.startTime;
        this.pause = false;

        this.displayTime = `00:00:00`;
        this.timeObj = [this.createText(this.displayTime, x, y, size), x, y, size];
        this.app.scene.add(this.timeObj[0]);

        this.pauseObj = this.createPicture('textures/pause.png', 20, 36, 5);
        this.app.scene.add(this.pauseObj);
    }

    /**
     * Toggles the pause state of the timer and updates the scene accordingly.
     * If the timer is paused, it displays a play icon. If the timer is resumed, it displays a pause icon.
     * It also adjusts the start time to account for the paused duration.
     */
    pauseTimer() {
        this.pause = !this.pause;
        this.app.scene.remove(this.pauseObj);

        if (this.pause) {
            this.pauseObj = this.createPicture('textures/play.png', 20, 36, 4);
            this.app.scene.add(this.pauseObj);
        } else {
            this.startTime = Date.now() - (this.lastTime - this.startTime);
            this.pauseObj = this.createPicture('textures/pause.png', 20, 36, 5);
            this.app.scene.add(this.pauseObj);
        }
    }

    /**
     * Displays information about the layers of the balloon in real-time.
     * 
     * @param {number} x The x-coordinate for the layer display, relative to the billboard's position
     * @param {number} y The y-coordinate for the layer display, relative to the billboard's position
     */
    startLayer(x, y) {
        this.layer = 0;
        
        this.addPicture('textures/height.png', x, y, 1.75, 9);

        const wind = this.createPicture('textures/wind.png', -20, 18, 2.5);
        wind.scale.set(0, 1, 1);
        if (this.rotation === Math.PI)
            wind.rotation.z = -Math.PI/2;
        else wind.rotation.z = Math.PI/2;

        this.layerObj = [this.createPicture('textures/balloon.png', -18, 22, 2.5), wind];
        this.layerObj.forEach((obj) => this.app.scene.add(obj));

        this.balloonAnimation = new MyAnimation(this.layerObj[0]);
        this.windAnimation = new MyAnimation(this.layerObj[1]);
    }

    /**
     * Initializes and starts the lap counter on the billboard.
     *
     * @param {number} laps - The total number of laps to display.
     * @param {number} x - The x-coordinate for the lap counter display.
     * @param {number} y - The y-coordinate for the lap counter display.
     * @param {number} size - The font size for the lap counter display.
     */
    startLaps(laps, x, y, size) {
        this.addText('Lap', x + 0.75, y + 2, 2);

        this.lap = 0;
        this.lapObj = [this.createText(`${this.lap}/${laps}`, x, y, size), laps, x, y, size];

        this.app.scene.add(this.lapObj[0]);
    }

    /**
     * Initializes and displays vouchers on the billboard.
     *
     * @param {number} x - The x-coordinate for the voucher display.
     * @param {number} y - The y-coordinate for the voucher display.
     * @param {number} size - The size of the voucher display.
     */
    startVouchers(x, y, size) {
        this.addPicture('textures/voucher.png', x - size, y, size);

        this.vouchers = 0;
        this.vouchersObj = [this.createText(`${this.vouchers}`, x, y, size), x, y, size];

        this.app.scene.add(this.vouchersObj[0]);
    }

    /**
     * Starts tracking the balloon position on a map representative of the track.
     * 
     * @param {number} x - The x-coordinate for the balloon tracking.
     * @param {number} y - The y-coordinate for the balloon tracking.
     * @param {number} size - The size of the balloon.
     */
    startBalloonTracking(x, y, size) {
        this.addPicture('textures/track.png', x, y, size);
        this.addText('Player', x + 8, y - 6, 1);
        this.addText('PC', x + 8, y - 8, 1);

        const geometry = new THREE.CircleGeometry(0.5);
        const rotatedX = this.rotation === Math.PI ? -x - 6.9 : x + 6.9;
        const z = this.rotation === Math.PI ? -0.3 - this.depth : 0.3 + this.depth;

        const red = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xFF0000 }));
        red.position.set(this.position.x + rotatedX, this.position.y + y - 5.9, this.position.z + z);
        this.pictureObjs.push(red);

        const blue = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x0000FF }));
        blue.position.set(this.position.x + rotatedX, this.position.y + y - 7.9, this.position.z + z);
        this.pictureObjs.push(blue);

        this.balloonTrackingOrigin = [this.position.x + (this.rotation === Math.PI ? x + 3.45 : -x - 3.45), this.position.y + y + 0.1, size];

        if (this.rotation === Math.PI) {
            red.rotation.y = Math.PI;
            blue.rotation.y = Math.PI;
        }

        this.app.scene.add(red);
        this.app.scene.add(blue);

        this.player = red.clone();
        this.player.scale.set(0.3, 0.3, 0.3);
        this.pc = blue.clone();
        this.pc.scale.set(0.3, 0.3, 0.3);

        this.app.scene.add(this.player);
        this.app.scene.add(this.pc);
    }

    /**
     * Stops the timer.
     * 
     * @returns {number} The current display time.
     */
    stopTimer() {
        this.startTime = null;
        return this.displayTime;
    }

    /**
     * Adds a text object to the billboard.
     *
     * @param {string} text - The text to be displayed.
     * @param {number} x - The x-coordinate for the text position, relative to the billboard's position.
     * @param {number} y - The y-coordinate for the text position, relative to the billboard's position.
     * @param {number} size - The size of the text.
     */
    addText(text, x, y, size) {
        const textObj = this.createText(text, x, y, size);
        this.textObjs.push(textObj);
        this.app.scene.add(textObj);
    }

    /**
     * Adds a picture to the scene.
     *
     * @param {string} texture - The texture of the picture.
     * @param {number} x - The x-coordinate of the picture, relative to the billboard's position.
     * @param {number} y - The y-coordinate of the picture, relative to the billboard's position.
     * @param {number} size - The size of the picture.
     * @param {number} [yRatio=1] - The y-axis ratio of the picture.
     */
    addPicture(texture, x, y, size, yRatio=1) {
        const pictureObj = this.createPicture(texture, x, y, size, yRatio);
        this.pictureObjs.push(pictureObj);
        this.app.scene.add(pictureObj);
    }

    /**
     * Adds a button to the scene with specified properties and elements.
     *
     * @param {string} id - The identifier for the button.
     * @param {number} x - The x-coordinate for the button's position, relative to the billboard's position.
     * @param {number} y - The y-coordinate for the button's position, relative to the billboard's position.
     * @param {number} width - The width of the button.
     * @param {number} height - The height of the button.
     * @param {Array<THREE.Object3D>} elements - The elements to be added to the button.
     * @param {number} [color=0xff0000] - The color of the button (default is red).
     */
    addButton(id, x, y, width, height, elements, color=0xff0000) {
        const group = new THREE.Group();
        const button = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, 0.5),
            new THREE.MeshLambertMaterial({ color: color })
        )
        button.name = id;
        group.add(button);

        elements.forEach((element) => {
            const z = this.rotation === Math.PI ? -0.3 : 0.3;
            element.position.set(element.position.x - this.position.x, element.position.y - this.position.y, z);
            group.add(element);
        });

        if (this.rotation === Math.PI) {
            group.position.set(this.position.x - x, this.position.y + y, this.position.z - this.depth);
        }
        else {
            group.position.set(this.position.x + x, this.position.y + y, this.position.z + this.depth);
        }

        this.buttonObjs.push(group);

        this.app.scene.add(group);
    }

    /**
     * Highlights the button with the specified ID by changing its color.
     *
     * @param {string} id - The ID of the button to highlight.
     */
    highlightButton(id) {
        this.buttonObjs.forEach((buttonObj) => {
            if (buttonObj.children[0].name === id) {
                buttonObj.children[0].material.color.set(0xa00000);
            }
        });
    }

    /**
     * Unhighlights a button by setting its color to red.
     *
     * @param {string} id - The ID of the button to unhighlight.
     */
    unHighlightButton(id) {
        this.buttonObjs.forEach((buttonObj) => {
            if (buttonObj.children[0].name === id) {
                buttonObj.children[0].material.color.set(0xFF0000);
            }
        });
    }

    /**
     * Removes the last added element to the button with the provided id.
     *
     * @param {string} id - The id of the button element to be removed.
     */
    removeButtonElement(id) {
        this.buttonObjs.forEach((buttonObj) => {
            if (buttonObj.children[0].name === id) {
                buttonObj.children.pop();
            }
        });
    }

    /**
     * Adds an element to the button object with the specified ID.
     *
     * @param {string} id - The ID of the button object to which the element will be added.
     * @param {THREE.Object3D} element - The element to be added to the button object.
     */
    addButtonElement(id, element) {
        this.buttonObjs.forEach((buttonObj) => {
            if (buttonObj.children[0].name === id) {
                const z = this.rotation === Math.PI ? -0.3 : 0.3;
                element.position.set(element.position.x - this.position.x, element.position.y - this.position.y, z);
                buttonObj.add(element);
            }
        });
    }

    /**
     * Adds a temporary element to the scene and removes it after 3 seconds.
     *
     * @param {THREE.Object3D} element - The element to be added to the scene.
     */
    addTempElement(element) {
        this.app.scene.add(element);
        setTimeout(() => {
            this.app.scene.remove(element);
        }, 3000);
    }

    /**
     * Creates a 3D text object using a sprite sheet.
     *
     * @param {string} text - The text to be displayed.
     * @param {number} size - The size of each character.
     * @param {number} [color=0x000000] - The color of the text in hexadecimal format.
     * @returns {THREE.Group} - A THREE.Group containing the 3D text meshes.
     */
    static createText(text, size, color=0x000000) {
        const group = new THREE.Group();
        text = text.toUpperCase();
    
        for (let i = 0, x = 0; i < text.length; i++, x += size) {
            // Clone the texture to ensure independent offsets for each character
            const texture = MyBillboard.font.clone();
            texture.repeat.set(1 / 15, 1 / 6);
    
            if (text[i] >= 'A' && text[i] <= 'M') {
                texture.offset.x = (text[i].charCodeAt(0) - 'A'.charCodeAt(0)) / 15;
                texture.offset.y = 5 / 6;
            } else if (text[i] >= 'N' && text[i] <= 'Z') {
                texture.offset.x = (text[i].charCodeAt(0) - 'N'.charCodeAt(0)) / 15;
                texture.offset.y = 4 / 6;
            } else if (text[i] >= '0' && text[i] <= '9') {
                texture.offset.x = (text[i].charCodeAt(0) - '0'.charCodeAt(0)) / 15;
                texture.offset.y = 3 / 6;
            } else if (text[i] === ':') {
                texture.offset.x = 1 / 15;
                texture.offset.y = 2 / 6;

            } else if (text[i] === '(') {
                texture.offset.x = 4 / 15;
                texture.offset.y = 1 / 6;
            }
            else if (text[i] === ')') {
                texture.offset.x = 13 / 15;
                texture.offset.y = 1 / 6;
            }
            else if (text[i] === '/')  {
                texture.offset.x = 4 / 15;
                texture.offset.y = 2 / 6;
            }
            else if (text[i] === '\\') {
                texture.offset.x = 5 / 15;
                texture.offset.y = 2 / 6;
            }
            else if (text[i] === '-') {
                texture.offset.x = 7 / 15;
                texture.offset.y = 2 / 6;
            }
            else if (text[i] === '_') {
                texture.offset.x = 8 / 15;
                texture.offset.y = 1 / 6;
            }
            else {
                // no char displayed
                texture.offset.x = 1;
                texture.offset.y = 1;
            }
    
            const material = new THREE.MeshBasicMaterial({ map: texture, color: color, transparent: true});
    
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
            mesh.position.set(x * 0.75, 0, 0);

            group.add(mesh);
        }
    
        return group;
    }

    /**
     * Creates a text group with the specified properties and positions it based on the billboard's rotation.
     *
     * @param {string} text - The text to be displayed.
     * @param {number} x - The x-coordinate offset for the text position.
     * @param {number} y - The y-coordinate offset for the text position.
     * @param {number} size - The size of the text.
     * @param {number} [color=0x000000] - The color of the text in hexadecimal format.
     * @returns {THREE.Group} The group containing the text meshes.
     */
    createText(text, x, y, size, color=0x000000) {
        const group = MyBillboard.createText(text, size, color);

        if (this.rotation === Math.PI) {
            group.children.forEach((mesh) => {
                mesh.position.x *= -1;
                mesh.rotation.y = Math.PI;
            });
            group.position.set(this.position.x - x, this.position.y + y, this.position.z - this.depth);
        } else {
            group.position.set(this.position.x + x, this.position.y + y, this.position.z + this.depth);
        }
    
        return group;
    }

    /**
     * Creates a picture mesh with the given texture and parameters.
     *
     * @param {string} texture - The path to the texture image.
     * @param {number} x - The x position offset for the mesh.
     * @param {number} y - The y position offset for the mesh.
     * @param {number} size - The size of the plane geometry.
     * @param {number} [yRatio=1] - The ratio of the height to the width of the picture.
     * @returns {THREE.Mesh} The created mesh with the texture applied.
     */
    createPicture(texture, x, y, size, yRatio=1) {
        const plane = new THREE.PlaneGeometry(size, size*yRatio);
        const tex = new THREE.TextureLoader().load(texture);
        const material = new THREE.MeshBasicMaterial({ map: tex, transparent: true });

        const mesh = new THREE.Mesh(plane, material);
        if (this.rotation === Math.PI) {
            mesh.position.set(this.position.x - x, this.position.y + y, this.position.z - this.depth);
            mesh.rotation.y = Math.PI;
        } else {
            mesh.position.set(this.position.x + x, this.position.y + y, this.position.z + this.depth);
        }

        return mesh;
    }
    

    /**
     * Updates the state of the billboard, including the displayed time and animations.
     * 
     * - If the timer is running and not paused, it updates the displayed time every second.
     * - Updates the balloon and wind animations if they are active.
     * 
     * @method
     */
    update() {
        if (this.startTime && !this.pause) {
            const currentTime = Date.now();

            if (currentTime - this.lastTime >= 1000) {
                const timer = currentTime - this.startTime;

                const hours = Math.floor(timer / 3600000).toString().padStart(2, '0');
                const minutes = Math.floor((timer % 3600000) / 60000).toString().padStart(2, '0');
                const seconds = Math.floor((timer % 60000) / 1000).toString().padStart(2, '0');
                this.displayTime = `${hours}:${minutes}:${seconds}`;
                
                this.lastTime = currentTime;
                this.app.scene.remove(this.timeObj[0]);
                this.timeObj[0] = this.createText(this.displayTime, this.timeObj[1], this.timeObj[2], this.timeObj[3]);
                this.app.scene.add(this.timeObj[0]);
            }
        }

        if (this.balloonAnimation) {
            this.balloonAnimation.update();
        }

        if (this.windAnimation) {
            this.windAnimation.update();
        }
    }

    /**
     * Updates the layer and animates the balloon and wind elements based on the provided update value.
     * 
     * @param {number} update - The value to update the layer by. Either 1 or -1.
     */
    updateLayer(update) {
        const positions = [
            ...this.layerObj[0].position,
            this.layerObj[0].position.x, this.layerObj[0].position.y + 3.5*update, this.layerObj[0].position.z
        ];

        const htmlOptions = { duration: 1000, fill: 'forwards' };
        document.getElementById('balloon').animate(
            [
                { transform: `translateY(${this.layer*-110}px)` },
                { transform: `translateY(${this.layer*-110 + update * -110}px)` }
            ],
            htmlOptions
        )
        
        while(this.balloonAnimation.isPlaying() || this.windAnimation.isPlaying()) {
            // sometimes there are some delays and the animations are not finished
        }
        this.balloonAnimation.createAnimation([0, 1], positions);

        if (this.layer === 0 || (this.layer === 1 && update === -1)) {
            let initial = [0, 1, 1], final = [1, 1, 1];
            this.windAnimation.createAnimation([0, 1], update === 1 ? [...initial, ...final] : [...final, ...initial], 'scale')

            initial = {transform: 'scaleX(0)', visibility: 'hidden'}, final = {transform: 'scaleX(1)', visibility: 'inherit'};
            document.getElementById('wind').animate(
                [
                    update === 1 ? initial : final,
                    update === 1 ? final : initial
                ],
                htmlOptions
            )
        } else if ((this.layer === 1 && update === 1) || (this.layer === 2 && update === -1)) {
            let initial = [1, 1, 1], final = [-1, 1, 1];
            this.windAnimation.createAnimation([0, 1], update === 1 ? [...initial, ...final] : [...final, ...initial], 'scale')

            initial = {transform: 'scaleX(1)'}, final = {transform: 'scaleX(-1)'};
            document.getElementById('wind').animate(
                [
                    update === 1 ? initial : final,
                    update === 1 ? final : initial
                ],
                htmlOptions
            )
        } else if ((this.layer === 2 && update === 1) || (this.layer === 3 && update === -1)) {
            let initial = this.layerObj[1].rotation
            let final = initial.clone();
            final.z += update === 1 ? Math.PI/2 : -Math.PI/2;
            this.windAnimation.createAnimation([0, 1], [...initial.toArray().slice(0, 3), ...final.toArray().slice(0,3)], 'rotation')

            initial = {transform: 'rotate(180deg)'}, final = {transform: 'rotate(90deg)'};
            document.getElementById('wind').animate(
                [
                    update === 1 ? initial : final,
                    update === 1 ? final : initial
                ],
                htmlOptions
            )
        } else if ((this.layer === 3 && update === 1) || (this.layer === 4 && update === -1)) {
            let initial = [-1, 1, 1], final = [1, 1, 1];
            this.windAnimation.createAnimation([0, 1], update === 1 ? [...initial, ...final] : [...final, ...initial], 'scale')

            initial = {transform: 'scaleY(1) rotate(90deg)'}, final = {transform: 'scaleY(-1) rotate(90deg)'};
            document.getElementById('wind').animate(
                [
                    update === 1 ? initial : final,
                    update === 1 ? final : initial
                ],
                htmlOptions
            )
        }

        this.layer += update;
    }

    /**
     * Increments the lap counter, updates the lap display, and adjusts its position if necessary.
     * @method
     */
    incrementLap() {
        this.app.scene.remove(this.lapObj[0]);
        this.lap++;
        if (this.lap > 10) {
            this.lapObj[0] = this.createText(`${this.lap}/${this.lapObj[1]}`, this.lapObj[2] - this.lapObj[4]*0.75, this.lapObj[3], this.lapObj[4]);
        } else {
            this.lapObj[0] = this.createText(`${this.lap}/${this.lapObj[1]}`, this.lapObj[2], this.lapObj[3], this.lapObj[4]);
        }
        this.app.scene.add(this.lapObj[0]);
    }

    /**
     * Updates the voucher count and updates the displayed voucher text.
     * If the current voucher count is zero and the quantity to be added is negative, the function returns without making any changes.
     *
     * @param {number} quantity - The number of vouchers to add (can be negative to subtract vouchers).
     */
    updateVoucher(quantity) {
        if (this.vouchers === 0 && quantity < 0)
            return;

        this.app.scene.remove(this.vouchersObj[0]);
        this.vouchers += quantity;
        this.vouchersObj[0] = this.createText(`${this.vouchers}`, this.vouchersObj[1], this.vouchersObj[2], this.vouchersObj[3]);
        this.app.scene.add(this.vouchersObj[0]);
    }

    /**
     * Updates the positions of the player and PC balloons on the map.
     *
     * @param {number} xPlayer - The x-coordinate of the player.
     * @param {number} zPlayer - The z-coordinate of the player.
     * @param {number} xPC - The x-coordinate of the PC.
     * @param {number} zPC - The z-coordinate of the PC.
     */
    updateBalloonTracking(xPlayer, zPlayer, xPC, zPC) {
        if (this.rotation === Math.PI) {
            xPlayer *= -1;
            xPC *= -1;
        }
        
        this.player.position.x = this.balloonTrackingOrigin[0] + xPlayer * this.balloonTrackingOrigin[2] / 250;
        this.player.position.y = this.balloonTrackingOrigin[1] - zPlayer * this.balloonTrackingOrigin[2] / 250;

        this.pc.position.x = this.balloonTrackingOrigin[0] + xPC * this.balloonTrackingOrigin[2] / 250;
        this.pc.position.y = this.balloonTrackingOrigin[1] - zPC * this.balloonTrackingOrigin[2] / 250;
    }

    /**
     * Clears all objects from the scene.
     * 
     * This method removes all text, picture, button, time, layer, lap, vouchers, player, pc, and pause objects from the scene.
     * It iterates through each type of object and removes them from the scene, then resets the corresponding arrays to empty.
     * 
     * @method clear
     */
    clear() {
        this.textObjs.forEach((textObj) => this.app.scene.remove(textObj));
        this.textObjs = [];

        this.pictureObjs.forEach((pictureObj) => this.app.scene.remove(pictureObj));
        this.pictureObjs = [];

        this.buttonObjs.forEach((buttonObj) => this.app.scene.remove(buttonObj));
        this.buttonObjs = [];

        if (this.timeObj) {
            this.app.scene.remove(this.timeObj[0]);
        }
        if (this.layerObj) {
            this.layerObj.forEach((obj) => this.app.scene.remove(obj));
        }
        if (this.lapObj) {
            this.app.scene.remove(this.lapObj[0]);
        }
        if (this.vouchersObj) {
            this.app.scene.remove(this.vouchersObj[0]);
        }
        if (this.player) {
            this.app.scene.remove(this.player);
        }
        if (this.pc) {
            this.app.scene.remove(this.pc);
        }
        if (this.pauseObj) {
            this.app.scene.remove(this.pauseObj);
        }
    }
}

export { MyBillboard };