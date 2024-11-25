import * as THREE from 'three';
import { MyTriangle } from './MyTriangle.js';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';
import { MyPolygon } from './MyPolygon.js';

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
        const triangle = new MyTriangle(...representation.xyz1, ...representation.xyz2, ...representation.xyz3);
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
            representation.thetastart * Math.PI / 180,
            representation.thetalength * Math.PI / 180
        );

        return cylinder;
    }

    static #getSphere(representation) {
        const sphere = new THREE.SphereGeometry(
            representation.radius,
            representation.slices,
            representation.stacks,
            representation.phistart * Math.PI / 180,
            representation.philength * Math.PI / 180,
            representation.thetastart * Math.PI / 180,
            representation.thetalength * Math.PI / 180
        );

        return sphere;
    }

    static #getNurbs(representation) {
        if ((representation.degree_u + 1) * (representation.degree_v + 1) !== representation.controlpoints.length)
            throw new Error(`Invalid number of control points for degree_u = ${representation.degree_u} and degree_v = ${representation.degree_v}`);

        const controlPoints = [];
        for (let i = 0; i <= representation.degree_u; i++) {
            controlPoints.push([]);
            for (let j = 0; j <= representation.degree_v; j++) {
                const point = representation.controlpoints[i * (representation.degree_v + 1) + j];
                controlPoints[i].push([point.x, point.y, point.z, 1]);
            }
        }

        return new MyNurbsBuilder().build(controlPoints, representation.degree_u, representation.degree_v, representation.parts_u, representation.parts_v);
    }

    static #getPolygon(representation) {
        const polygon = new MyPolygon(representation.radius, representation.stacks, representation.slices, representation.color_c, representation.color_p)
        return polygon;
    }

}

export { MyPrimitive };