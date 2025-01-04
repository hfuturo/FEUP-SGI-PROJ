import * as THREE from 'three';

/**
 * Class representing a route manager.
 */
class MyRoute {
    /**
     * Create a route manager.
     * @param {Object} app - The application instance.
     * @param {Object} routes - An object containing route data, where keys are route IDs and values are arrays of points.
     */
    constructor(app, routes) {
        this.app = app;
    
        this.routes = {};
        for (let id in routes) {
            this.routes[id] = [];
            routes[id].forEach((point) => {
                this.routes[id].push(new THREE.Vector3(point[0], point[1], point[2]));
            });
        }
    
        this.selectedRoute = null;
    }

    /**
     * Get the route by its ID.
     * @param {string} id - The ID of the route.
     * @returns {Array<THREE.Vector3>} The array of points representing the route.
     */
    getRoute(id) {
        return this.routes[id];
    }

    /**
     * Display the specified route on the scene.
     * @param {string} route - The ID of the route to display.
     */
    displayRoute(route) {
        if (this.selectedRoute) {
            this.app.scene.remove(this.selectedRoute);
        }

        if (route) {
            const marker = new THREE.Mesh(
                new THREE.SphereGeometry(1, 32, 32),
                new THREE.MeshBasicMaterial({ color: 0x0000ff })
            )

            this.selectedRoute = new THREE.Group();
            this.routes[route].forEach((point) => {
                const clone = marker.clone();
                clone.position.copy(point);
                this.selectedRoute.add(clone);
            });
            this.app.scene.add(this.selectedRoute);
        }
    }

}

export { MyRoute };