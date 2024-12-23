import * as THREE from 'three';

class MyBillboard {
    constructor(app, position) {
        this.app = app;
        this.position = position;

        this.font = new THREE.TextureLoader().load('textures/font.png');
    }

    startTimer(x, y, size) {
        if (this.timeObj) {
            this.app.scene.remove(this.timeObj[0]);
        }
        this.startTime = Date.now();
        this.lastTime = this.startTime;

        const displayTime = `00:00:00`;
        this.timeObj = [this.drawText(displayTime, x, y, size), x, y, size];
        this.app.scene.add(this.timeObj[0]);
    }

    startLayer(x, y, size) {
        if (this.layerObj) {
            this.app.scene.remove(this.layerObj[0]);
        }

        this.layer = 0;
        this.layerObj = [this.drawText(`Layer:${this.layer}(-)`, x, y, size), x, y, size];

        this.app.scene.add(this.layerObj[0]);
    }

    startLaps(x, y, size) {
        if (this.lapObj) {
            this.app.scene.remove(this.lapObj[0]);
        }

        this.lap = 0;
        this.lapObj = [this.drawText(`Lap:${this.lap}/`, x, y, size), x, y, size];

        this.app.scene.add(this.lapObj[0]);
    }

    startVouchers(x, y, size) {
        if (this.vouchersObj) {
            this.app.scene.remove(this.vouchersObj[0]);
        }

        this.vouchers = 0;
        this.vouchersObj = [this.drawText(`Vouchers:${this.vouchers}`, x, y, size), x, y, size];

        this.app.scene.add(this.vouchersObj[0]);
    }

    stopTimer() {
        this.startTime = null;
    }

    drawText(text, x, y, size) {
        const group = new THREE.Group();
        text = text.toUpperCase();
    
        for (let i = 0, x = 0; i < text.length; i++, x += size) {
            // Clone the texture to ensure independent offsets for each character
            const texture = this.font.clone();
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
            else if (text[i] === '-') {
                texture.offset.x = 7 / 15;
                texture.offset.y = 2 / 6;
            }
            else {
                // no char displayed
                texture.offset.x = 1;
                texture.offset.y = 1;
            }
    
            const material = new THREE.MeshBasicMaterial({ map: texture, color: 0x000000, transparent: true });
    
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
            mesh.position.set(this.position.x + x*0.75, this.position.y, this.position.z + 1.1);
            group.add(mesh);
        }
    
        group.position.set(this.position.x + x, this.position.y + y, this.position.z);
    
        return group;
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
                this.timeObj[0] = this.drawText(displayTime, this.timeObj[1], this.timeObj[2], this.timeObj[3]);
                this.app.scene.add(this.timeObj[0]);
            }
        }
    }

    updateLayer(update) {
        if ((this.layer === 0 && update < 0) || (this.layer === 4 && update > 0))
            return;
        
        this.app.scene.remove(this.layerObj[0]);
        this.layer += update;

        let direction;

        switch (this.layer) {
            case 0:
                direction = "-";
                break;
            case 1:
                direction = "N";
                break;
            case 2:
                direction = "S";
                break;
            case 3:
                direction = "E";
                break;
            case 4:
                direction = "W";
                break;
        }

        this.layerObj[0] = this.drawText(`Layer:${this.layer}(${direction})`, this.layerObj[1], this.layerObj[2], this.layerObj[3]);
        this.app.scene.add(this.layerObj[0]);
    }

    incrementLap() {
        this.app.scene.remove(this.lapObj[0]);
        this.lap++;
        this.lapObj[0] = this.drawText(`Lap:${this.lap}/`);
        this.app.scene.add(this.lapObj[0]);
    }

    updateVoucher(quantity) {
        if (this.vouchers === 0 && quantity < 0)
            return;

        this.app.scene.remove(this.vouchersObj[0]);
        this.vouchers += quantity;
        this.vouchersObj[0] = this.drawText(`Vouchers:${this.vouchers}`, this.vouchersObj[1], this.vouchersObj[2], this.vouchersObj[3]);
        this.app.scene.add(this.vouchersObj[0]);
    }
}

export { MyBillboard };