import * as THREE from 'three';

class MyPrimitive {

    static getPrimitive(prim) {

        switch (prim.subtype) {
            case 'rectangle':
                return MyPrimitive.#getRectangle(prim.representations[0]);
            case 'triangle':
                return MyPrimitive.#getTriangle(prim.representations[0]);
            case 'box':
                return MyPrimitive.#getBox(prim.representations[0]);
            case 'cylinder':
                return MyPrimitive.#getCylinder(prim.representations[0]);
            case 'sphere':
                return MyPrimitive.#getSphere(prim.representations[0]);
            case 'nurbs':
                return MyPrimitive.#getNurbs(prim.representations[0]);
            case 'polygon':
                return MyPrimitive.#getPolygon(prim.representations[0]);
            default:
                break;
        }

    }

    static #getRectangle(representation) {
        const width = Math.abs(representation.xy1[0] - representation.xy2[0]);
        const height = Math.abs(representation.xy1[1] - representation.xy2[1]);
        const widthSegments = representation.parts_x;
        const heightSegments = representation.parts_y;

        const rectangle = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);

        return rectangle;
    }

    static #getTriangle(representation) {
        const triangle = new THREE.Triangle(representation.xyz1, representation.xyz2, representation.xyz3);
        return triangle;
    }

    static #getBox(representation) {
        const width = Math.abs(representation.xyz1[0] - representation.xyz2[0]);
        const height = Math.abs(representation.xyz1[1] - representation.xyz2[1]);
        const depth = Math.abs(representation.xyz1[2] - representation.xyz2[2]);
        const widthSegments = representation.parts_x;
        const heightSegments = representation.parts_y;
        const depthSegments = representation.parts_z;

        const box = new THREE.BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
        
        return box;
    }

    static #getCylinder(representation) {
        const cylinder = new THREE.CylinderGeometry(
            representation.top,
            representation.base,
            representation.height,
            representation.slices,
            representation.stacks,
            representation.capsclose,
            representation.thetaStart,
            representation.thetaLength
        );

        return cylinder;
    }

    static #getSphere(representation) {
        const sphere = new THREE.SphereGeometry(
            representation.radius,
            representation.slices,
            representation.stacks,
            representation.phistart,
            representation.philength,
            representation.thetastart,
            representation.thetalength
        );

        return sphere;
    }

    static #getNurbs(representation) {
    }

    static #getPolygon(representation) {
    }

}

export { MyPrimitive };