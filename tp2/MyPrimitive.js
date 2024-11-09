import * as THREE from 'three';

class MyPrimitive {
    static getPrimitive(prim) {
        switch (prim.subtype) {
            case 'rectangle':
                this.#getRectangle(prim.representations[0]);
                break;
            case 'triangle':
                break;
            case 'box':
                break;
            case 'cylinder':
                break;
            case 'sphere':
                break;
            case 'nurbs':
                break;
            case 'polygon':
                break;
            default:
                break;
        }
    }

    static #getRectangle(representation) {

    }
}

export { MyPrimitive };