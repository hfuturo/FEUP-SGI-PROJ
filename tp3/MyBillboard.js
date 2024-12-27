import * as THREE from 'three';
import { MyAnimation } from './MyAnimation.js';

class MyBillboard {
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

    startTimer(x, y, size) {
        this.startTime = Date.now();
        this.lastTime = this.startTime;

        const displayTime = `00:00:00`;
        this.timeObj = [this.createText(displayTime, x, y, size), x, y, size];
        this.app.scene.add(this.timeObj[0]);
    }

    startLayer(x, y) {
        this.layer = 0;
        
        this.addPicture('textures/height.png', x, y, 1.75, 9);

        const wind = this.createPicture('textures/wind.png', -20, 18, 2.5);
        wind.scale.set(0, 1, 1);
        if (this.rotation === Math.PI)
            wind.rotation.z = -Math.PI/2;
        else wind.rotation.z = Math.PI/2;

        this.layerObj = [this.createPicture('textures/balloon.jpg', -18, 22, 2.5), wind];
        this.layerObj.forEach((obj) => this.app.scene.add(obj));

        this.balloonAnimation = new MyAnimation(this.layerObj[0]);
        this.windAnimation = new MyAnimation(this.layerObj[1]);
    }

    startLaps(laps, x, y, size) {
        this.lap = 0;
        this.lapObj = [this.createText(`${this.lap}/${laps}`, x, y, size), laps, x, y, size];

        this.app.scene.add(this.lapObj[0]);
    }

    startVouchers(x, y, size) {
        const img = this.createPicture('textures/voucher.png', x - size, y, size);
        this.app.scene.add(img);

        this.vouchers = 0;
        this.vouchersObj = [this.createText(`${this.vouchers}`, x, y, size), x, y, size];

        this.app.scene.add(this.vouchersObj[0]);
    }

    stopTimer() {
        this.startTime = null;
    }

    addText(text, x, y, size) {
        const textObj = this.createText(text, x, y, size);
        this.textObjs.push(textObj);
        this.app.scene.add(textObj);
    }

    addPicture(texture, x, y, size, yRatio=1) {
        const pictureObj = this.createPicture(texture, x, y, size, yRatio);
        this.pictureObjs.push(pictureObj);
        this.app.scene.add(pictureObj);
    }

    addButton(id, x, y, width, height, elements) {
        const group = new THREE.Group();
        const button = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, 0.5),
            new THREE.MeshLambertMaterial({ color: 0xFF0000 })
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

    highlightButton(id) {
        this.buttonObjs.forEach((buttonObj) => {
            if (buttonObj.children[0].name === id) {
                buttonObj.children[0].material.color.set(0xa00000);
            }
        });
    }

    unHighlightButton(id) {
        this.buttonObjs.forEach((buttonObj) => {
            if (buttonObj.children[0].name === id) {
                buttonObj.children[0].material.color.set(0xFF0000);
            }
        });
    }

    removeButtonElement(id) {
        this.buttonObjs.forEach((buttonObj) => {
            if (buttonObj.children[0].name === id) {
                buttonObj.children.pop();
            }
        });
    }

    addButtonElement(id, element) {
        this.buttonObjs.forEach((buttonObj) => {
            if (buttonObj.children[0].name === id) {
                const z = this.rotation === Math.PI ? -0.3 : 0.3;
                element.position.set(element.position.x - this.position.x, element.position.y - this.position.y, z);
                buttonObj.add(element);
            }
        });
    }

    addTempElement(element) {
        this.app.scene.add(element);
        setTimeout(() => {
            this.app.scene.remove(element);
        }, 3000);
    }

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
    

    update() {
        if (this.startTime) {
            const currentTime = Date.now();

            if (currentTime - this.lastTime >= 1000) {
                const timer = currentTime - this.startTime;

                const hours = Math.floor(timer / 3600000).toString().padStart(2, '0');
                const minutes = Math.floor((timer % 3600000) / 60000).toString().padStart(2, '0');
                const seconds = Math.floor((timer % 60000) / 1000).toString().padStart(2, '0');
                const displayTime = `${hours}:${minutes}:${seconds}`;
                
                this.lastTime = currentTime;
                this.app.scene.remove(this.timeObj[0]);
                this.timeObj[0] = this.createText(displayTime, this.timeObj[1], this.timeObj[2], this.timeObj[3]);
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

    updateLayer(update) {
        const positions = [
            ...this.layerObj[0].position,
            this.layerObj[0].position.x, this.layerObj[0].position.y + 3.5*update, this.layerObj[0].position.z
        ];
        this.balloonAnimation.createAnimation([0, 1], positions);

        if (this.layer === 0 || (this.layer === 1 && update === -1)) {
            const initial = [0, 1, 1], final = [1, 1, 1];
            this.windAnimation.createAnimation([0, 1], update === 1 ? [...initial, ...final] : [...final, ...initial], 'scale')
        } else if ((this.layer === 1 && update === 1) || (this.layer === 2 && update === -1)) {
            const initial = [1, 1, 1], final = [-1, 1, 1];
            this.windAnimation.createAnimation([0, 1], update === 1 ? [...initial, ...final] : [...final, ...initial], 'scale')
        } else if ((this.layer === 2 && update === 1) || (this.layer === 3 && update === -1)) {
            const initial = this.layerObj[1].rotation
            const final = initial.clone();
            final.z += update === 1 ? Math.PI/2 : -Math.PI/2;
            this.windAnimation.createAnimation([0, 1], [...initial.toArray().slice(0, 3), ...final.toArray().slice(0,3)], 'rotation')
        } else if ((this.layer === 3 && update === 1) || (this.layer === 4 && update === -1)) {
            const initial = [-1, 1, 1], final = [1, 1, 1];
            this.windAnimation.createAnimation([0, 1], update === 1 ? [...initial, ...final] : [...final, ...initial], 'scale')
        }

        this.layer += update;
    }

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

    updateVoucher(quantity) {
        if (this.vouchers === 0 && quantity < 0)
            return;

        this.app.scene.remove(this.vouchersObj[0]);
        this.vouchers += quantity;
        this.vouchersObj[0] = this.createText(`${this.vouchers}`, this.vouchersObj[1], this.vouchersObj[2], this.vouchersObj[3]);
        this.app.scene.add(this.vouchersObj[0]);
    }

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
    }
}

export { MyBillboard };