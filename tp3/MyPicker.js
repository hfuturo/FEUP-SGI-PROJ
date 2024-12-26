import * as THREE from 'three'

class MyPicker {
    constructor(app, objects, pickingHelper) {
        this.app = app;

        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 100

        this.pointer = new THREE.Vector2()

        this.objects = objects
        this.pickingHelper = pickingHelper

        document.addEventListener(
            "pointerdown",
            this.onPointerMove.bind(this)
        );
    }

    add(object) {
        this.objects.push(object)
    }

    removeObjects() {
        this.objects = []
    }

    onPointerMove(event) {
        if (this.objects.length === 0 || event.button !== 0) return;

        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.app.activeCamera);
        
        const intersects = this.raycaster.intersectObjects(this.objects);

        this.pickingHelper(intersects)
    }
}

export { MyPicker }