import * as THREE from 'three'

/**
 * Class representing a picker for 3D objects using raycasting.
 */
class MyPicker {
    /**
     * Create a MyPicker instance.
     * @param {Object} app - The application instance containing the active camera.
     * @param {Array} objects - The array of 3D objects to be picked.
     * @param {Function} pickingHelper - The callback function to handle the picking result.
     */
    constructor(app, objects, pickingHelper) {
        this.app = app;

        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 50

        this.pointer = new THREE.Vector2()

        this.objects = objects
        this.pickingHelper = pickingHelper
        this.boundPointerDown = this.onPointerMove.bind(this)
        this.activate()
    }

    /**
     * Add a 3D object to the list of objects to be picked.
     * @param {Object} object - The 3D object to add.
     */
    add(object) {
        this.objects.push(object)
    }

    /**
     * Remove all 3D objects from the list of objects to be picked.
     */
    removeObjects() {
        this.objects = []
    }

    /**
     * Handle the pointer move event to perform raycasting and picking.
     * @param {Event} event - The pointer move event.
     */
    onPointerMove(event) {
        if (this.objects.length === 0 || event.button !== 0) return;

        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.app.activeCamera);

        const intersects = this.raycaster.intersectObjects(this.objects);

        this.pickingHelper(intersects)
    }

    /**
     * Activate the picker by adding the pointer move event listener.
     */
    activate() {
        document.addEventListener(
            "pointerdown",
            this.boundPointerDown
        );
    }

    /**
     * Dispose the picker by removing the pointer move event listener.
     */
    dispose() {
        document.removeEventListener(
            "pointerdown",
            this.boundPointerDown
        );
    }
}

export { MyPicker }