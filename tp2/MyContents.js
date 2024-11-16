import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MyPrimitive } from './MyPrimitive.js';
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
        this.reader.open("scenes/stadium.json");

        this.textures = [];
        this.materials = [];
        this.primitives = [];
        this.lights = [];
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

        this.app.scene.background.r = data.options.background[0];
        this.app.scene.background.g = data.options.background[1];
        this.app.scene.background.b = data.options.background[2];
        
        const ambientLight = new THREE.AmbientLight(data.options.ambientLight);
        this.app.scene.add(ambientLight);

        const fog = new THREE.Fog(data.fog.color, data.fog.near, data.fog.far);
        this.app.scene.fog = fog;

        this.initCameras(data);

        this.initTextures(data.textures);
        
        this.initMaterials(data.materials);

        this.initPrimitives(data.nodes[data.rootId]);

        const objects = this.initObjects(data.nodes[data.rootId]);
        this.app.scene.add(objects);
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
                flatShading: m.shading
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

    initPrimitives(node, parentId) {
        if (node.type === 'node') {
            if (node.children.length === 0) {
                throw new Error(`Node "${node.id}" has no children.`);
            }
            let prim = false;
            node.children.forEach(child => {
                if (prim)
                    throw new Error(`Node "${node.id}" has more than 1 child primitive.`);

                if (child.type === 'primitive') 
                    prim = true;

                this.initPrimitives(child, node.id);
            });
        } else if (node.type === 'primitive') {
            const primitive = MyPrimitive.getPrimitive(node);

            this.primitives[parentId] = primitive;
        } else {
            this.initLight(node);
        }
    }

    initLight(lightSpec) {
        
        let light;
        if (lightSpec.type === 'pointlight') {
            light = new THREE.PointLight(
                lightSpec.color,
                lightSpec.intensity,
                lightSpec.distance,
                lightSpec.decay
            )

        } else if (light.type === 'spotlight') {
            light = new THREE.SpotLight(
                lightSpec.color,
                lightSpec.intensity,
                lightSpec.distance,
                lightSpec.angle,
                lightSpec.penumbra,
                lightSpec.decay
            )
            light.target.position.set(...lightSpec.target);

        } else if (light.type === 'directionallight') {
            light = new THREE.DirectionalLight(
                lightSpec.color,
                lightSpec.intensity
            )

            light.shadow.left = lightSpec.shadowleft;
            light.shadow.right = lightSpec.shadowright;
            light.shadow.bottom = lightSpec.shadowbottom;
            light.shadow.top = lightSpec.shadowtop;
        }

        light.position.set(...lightSpec.position);
        light.castShadow = lightSpec.castShadow;
        light.shadow.far = lightSpec.shadowFar;
        light.shadow.mapSize.width = lightSpec.shadowWidth;
        light.shadow.mapSize.height = lightSpec.shadowHeight;

        this.lights[lightSpec.id] = light;
        if (lightSpec.enabled) 
            this.app.scene.add(light);
    }

    initObjects(node, parentId, material) {
        if (node.type === 'node') {
            const group = new THREE.Group();
            node.children.forEach(child => {
                let obj;
                if (node.materialIds.length > 0) {
                    obj = this.initObjects(child, node.id, node.materialIds[0]);
                } else {
                    obj = this.initObjects(child, node.id, material);
                }
                
                if (obj !== undefined) {
                    group.add(obj);
                }
            });

            for (let t of node.transformations) {
                if (t.type == "T") {
                    group.position.set(...t.translate);
                } else if (t.type == "R") {
                    group.rotation.set(...t.rotation.map(x => x * Math.PI / 180));
                } else if (t.type == "S") {
                    group.scale.set(...t.scale);
                }
            }

            return group;
        } else if (node.type === 'primitive') {
            return new THREE.Mesh(this.primitives[parentId], this.materials[material]);
        }
    }

    update() {
    }
}

export { MyContents };
