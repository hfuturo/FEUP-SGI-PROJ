import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
/**
 *  This class contains the contents of out application
 */
class MyContents {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app
        this.axis = null

        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        this.reader.open("scenes/demo/demo.json");

        this.textures = [];
        this.materials = [];
    }

    /**
     * initializes the contents
     */
    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }
    }

    /**
     * Called when the scene JSON file load is completed
     * @param {Object} data with the entire scene object
     */
    onSceneLoaded(data) {
        console.info("YASF loaded.")
        this.reader.readJson(data);
        this.onAfterSceneLoadedAndBeforeRender(this.reader.data);
    }

    printYASF(data, indent = '') {
        for (let key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                console.log(`${indent}${key}:`);
                this.printYASF(data[key], indent + '\t');
            } else {
                console.log(`${indent}${key}: ${data[key]}`);
            }
        }
    }

    onAfterSceneLoadedAndBeforeRender(data) {
        // this.printYASF(data)

        this.app.scene.background = new THREE.Color(data.options.background);
        
        const ambientLight = new THREE.AmbientLight(data.options.ambientLight);
        this.app.scene.add(ambientLight);

        const fog = new THREE.Fog(data.fog.color, data.fog.near, data.fog.far);
        this.app.scene.fog = fog;

        this.initCameras(data);

        this.initTextures(data.textures);
        
        this.initMaterials(data.materials);
    }

    initCameras(data) {
        const aspect = window.innerWidth / window.innerHeight;

        for (let camId in data.cameras) {
            const c = data.cameras[camId];
            if (c.type === 'perspective') {
                const camera = new THREE.PerspectiveCamera(
                    c.angle,
                    aspect,
                    c.near,
                    c.far
                )
                camera.position.set(...c.location);
                camera.lookAt(...c.target);

                this.app.cameras[camId] = camera;

            } else if (camera.type === 'orthogonal') {
                const camera = new THREE.OrthographicCamera(
                    c.left,
                    c.right,
                    c.top,
                    c.bottom,
                    c.near,
                    c.far
                )
                camera.position.set(...c.location);
                camera.lookAt(...c.target);

                this.app.cameras[camId] = camera;
            }
        }

        this.app.setActiveCamera(data.activeCameraId);
    }

    initTextures(textures) {
        const loader = new THREE.TextureLoader();

        for (let textureId in textures) {
            const texture = loader.load(textures[textureId].filepath);
            this.textures[textureId] = texture
        }
    }

    initMaterials(materials) {
        for (let materialId in materials) {
            const m = materials[materialId];

            const material = new THREE.MeshPhongMaterial({
                color: m.color,
                specular: m.specular,
                shininess: m.shininess,
                emissive: m.emissive,
                transparent: m.transparent,
                opacity: m.opacity,
                wireframe: m.wireframe,
                flatShading: m.shading === 'flat', // What about "none"
            })

            if (m.textureref) {
                material.map = this.textures[m.textureref];
                material.map.repeat.set(
                    1 / m.texlength_s,
                    1 / m.texlength_t
                )
                if (m.twosided)
                    material.side = THREE.DoubleSide;
            }

            // TODO: bumpref, bumpscale, specularref

            this.materials[materialId] = material;
        }
    }

    update() {
    }
}

export { MyContents };
