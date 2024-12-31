import * as THREE from 'three';

class MyRoute {
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

    getRoute(id) {
        return this.routes[id];
    }

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