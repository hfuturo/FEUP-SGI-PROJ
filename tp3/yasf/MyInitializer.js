import * as THREE from 'three';
import { MyFileReader } from './MyFileReader.js';
import { MyPrimitive } from './MyPrimitive.js';

class MyInitializer {
    constructor(app, sceneFile) {
        this.app = app;

        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        this.reader.open(sceneFile);

        this.textures = [];
        this.materials = [];
        this.primitives = [];
        this.lights = [];
        this.lightClones = [];
        this.wireframe = [];
    }

    /**
     * Called when the scene JSON file load is completed
     * @param {Object} data with the entire scene object
     */
    onSceneLoaded(data) {
        this.reader.readJson(data);
        this.onAfterSceneLoadedAndBeforeRender(this.reader.data);
    }

    onAfterSceneLoadedAndBeforeRender(data) {
        this.app.scene.background.r = data.options.background[0];
        this.app.scene.background.g = data.options.background[1];
        this.app.scene.background.b = data.options.background[2];
        
        const ambientLight = new THREE.AmbientLight(new THREE.Color(...data.options.ambient.slice(0, 3)), data.options.ambient[3]);
        this.app.scene.add(ambientLight);

        const fog = new THREE.Fog(new THREE.Color(...data.fog.color), data.fog.near, data.fog.far);
        this.app.scene.fog = fog;

        this.initCameras(data);

        this.initTextures(data.textures);
        
        this.initMaterials(data.materials);

        this.initSkybox(data.skybox);

        this.initPrimitives(data.nodes[data.rootId]);

        const objects = this.initObjects(data.nodes[data.rootId]);
        this.app.scene.add(objects);
        
        for (const mat in this.materials) {
            if (this.materials[mat].wireframe) {
                this.wireframe.push(mat);
            }
        }
        this.activeLight = Object.keys(this.lights)[0];

        this.app.gui.finish();
    }

    /**
     * Intializes cameras based on JSON specifications
     * @param {*} data parsed JSON data
     */
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
                this.app.lookAt[camId] = new THREE.Vector3(...c.target);

            } else if (c.type === 'orthogonal') {
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
                this.app.lookAt[camId] = new THREE.Vector3(...c.target);
            }
        }

        this.app.setActiveCamera(data.activeCameraId);
    }

    /**
     * Initializes textures based on JSON specifications
     * @param {*} textures parsed JSON textures
     */
    initTextures(textures) {
        const loader = new THREE.TextureLoader();

        for (const textureId in textures) {
            const rawTexture = textures[textureId];
            const path = rawTexture.filepath;

            let texture;

            if (rawTexture.isVideo) {
                const video = document.createElement("video");
                video.src = path;
                video.load();
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                texture = new THREE.VideoTexture(video);
                texture.colorSpace = THREE.SRGBColorSpace;
            }
            else {
                texture = loader.load(path);
            }

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            for (const key in textures[textureId]) {
                if (key.startsWith('mipmap') && textures[textureId][key] !== undefined) {
                    texture.generateMipmaps = false;

                    loader.load(textures[textureId][key], 
                        function(mipmapTexture)
                        {
                            const canvas = document.createElement('canvas')
                            const ctx = canvas.getContext('2d')
                            ctx.scale(1, 1);
                            
                            const img = mipmapTexture.image         
                            canvas.width = img.width;
                            canvas.height = img.height
            
                            ctx.drawImage(img, 0, 0 )
                                        
                            texture.mipmaps[parseInt(key[6])] = canvas
                        },
                        undefined,
                        function(err) {
                            console.error('Unable to load the image ' + path + ' as mipmap level ' + parseInt(key[6]) + ".", err)
                        }
                    )

                }
            }

            this.textures[textureId] = texture
        }
    }

    /**
     * Initializes materials based on JSON specifications
     * @param {*} materials parsed JSON materials
     */
    initMaterials(materials) {
        for (let materialId in materials) {
            const m = materials[materialId];

            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(...m.color),
                specular: new THREE.Color(...m.specular),
                shininess: m.shininess,
                emissive: new THREE.Color(...m.emissive),
                transparent: m.transparent,
                opacity: m.opacity,
                wireframe: m.wireframe,
                flatShading: m.shading
            })

            if (m.twosided)
                material.side = THREE.DoubleSide;

            if (m.textureref) {
                material.map = this.textures[m.textureref];
                material.map.repeat.set(
                    1 / m.texlength_s,
                    1 / m.texlength_t
                );
            }

            if (m.bumpref) {
                material.bumpMap = this.textures[m.bumpref];
                material.bumpScale = m.bumpscale;
                material.bumpMap.repeat.set(
                    1 / m.texlength_s,
                    1 / m.texlength_t
                );
            }

            if (m.specularref) {
                material.specularMap = this.textures[m.specularref];
                material.specularMap.repeat.set(
                    1 / m.texlength_s,
                    1 / m.texlength_t
                );
            }

            this.materials[materialId] = material;
        }
    }

    /**
     * Initializes the skybox based on JSON specifications
     * @param {*} skybox parsed JSON skybox
     */
    initSkybox(skybox) {
        const loader = new THREE.TextureLoader();

        const textures = [
            loader.load(skybox.front),
            loader.load(skybox.back),
            loader.load(skybox.up),
            loader.load(skybox.down),
            loader.load(skybox.right),
            loader.load(skybox.left)
        ]
        const emissive = new THREE.Color(...skybox.emissive);

        const box = new THREE.BoxGeometry(...skybox.size);
        const mesh = new THREE.Mesh(box, textures.map(t => new THREE.MeshLambertMaterial({ 
            map: t, 
            side: THREE.BackSide, 
            emissive: emissive, 
            emissiveIntensity: skybox.intensity 
        })));
        mesh.position.set(...skybox.center);

        this.app.scene.add(mesh);
    }

    /**
     * Traverses the scene graph and initializes the primitives and lights (leaf nodes)
     * @param {*} node current node
     * @param {*} parentId id of the parent node
     */
    initPrimitives(node, parentId) {
        if (node.type === 'node') {
            if (node.children.length === 0 && node.lods.length === 0) {
                console.log(node);
                throw new Error(`Node "${node.id}" has no children.`);
            }
            node.children.forEach(child => {
                this.initPrimitives(child, node.id);
            });
            node.lods.forEach(lod => {
                for (const lodNode of lod.lodNodes) {
                    this.initPrimitives(lodNode.node, node.id);
                }
            });
        } else if (node.type === 'primitive') {
            const primitive = MyPrimitive.getPrimitive(node);

            this.primitives[parentId] = primitive;
        } else {
            this.initLight(node);
        }
    }

    /**
     * Initializes a light source based on its JSON specification
     * @param {*} lightSpec parsed JSON light specification
     */
    initLight(lightSpec) {
        
        let light;
        if (lightSpec.type === 'pointlight') {
            light = new THREE.PointLight(
                lightSpec.color,
                lightSpec.intensity,
                lightSpec.distance,
                lightSpec.decay
            )

        } else if (lightSpec.type === 'spotlight') {
            light = new THREE.SpotLight(
                lightSpec.color,
                lightSpec.intensity,
                lightSpec.distance,
                lightSpec.angle * Math.PI / 180,
                lightSpec.penumbra,
                lightSpec.decay
            )
            light.target.position.set(...lightSpec.target);

        } else if (lightSpec.type === 'directionallight') {
            light = new THREE.DirectionalLight(
                lightSpec.color,
                lightSpec.intensity
            )

            light.shadow.camera.left = lightSpec.shadowleft;
            light.shadow.camera.right = lightSpec.shadowright;
            light.shadow.camera.bottom = lightSpec.shadowbottom;
            light.shadow.camera.top = lightSpec.shadowtop;
        }

        light.position.set(...lightSpec.position);
        light.castShadow = lightSpec.castshadow;
        light.shadow.camera.far = lightSpec.shadowfar;
        light.shadow.mapSize.set(lightSpec.shadowmapsize, lightSpec.shadowmapsize);

        light.visible = lightSpec.enabled;
        this.lights[lightSpec.id] = light;
    }

    /**
     * Traverse the scene graph and initializes the objects (non-leaf nodes) grouping nodes with the same parent
     * Propagates materials and shadows
     * @param {*} node current node
     * @param {*} parentId id of the parent node
     * @param {*} material inherited material or undefined if no material is inherited
     * @param {*} receiveshadows inherited receiveshadows or false if no receiveshadows is inherited
     * @param {*} castshadows inherited castshadows or false if no castshadows is inherited
     * @returns 
     */
    initObjects(node, parentId, material, receiveshadows=false, castshadows=false) {
        if (node.type === 'node') {
            const group = new THREE.Group();
            node.children.forEach(child => {
                let obj;
                if (node.materialIds.length > 0) {
                    obj = this.initObjects(child, node.id, node.materialIds[0],
                        node.receiveshadows || receiveshadows, node.castshadows || castshadows
                    );
                } else {
                    obj = this.initObjects(child, node.id, material,
                        node.receiveshadows || receiveshadows, node.castshadows || castshadows
                    );
                }
                
                if (obj !== undefined) {
                    group.add(obj);
                }
            });
            
            node.lods.forEach(lod => {
                const LOD = new THREE.LOD();
                for (const lodNode of lod.lodNodes) {
                    let obj;
                    if (node.materialIds.length > 0) {
                        obj = this.initObjects(lodNode.node, node.id, node.materialIds[0],
                            node.receiveshadows || receiveshadows, node.castshadows || castshadows
                        );
                    } else {
                        obj = this.initObjects(lodNode.node, node.id, material, 
                            node.receiveshadows || receiveshadows, node.castshadows || castshadows
                        );
                    }
                        

                    LOD.addLevel(obj, lodNode.mindist);
                }
                group.add(LOD);
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
            let mesh;
            if (node.subtype === 'polygon') {
                const mat = this.materials[material];
                mat.vertexColors = true;

                mesh = new THREE.Mesh(this.primitives[parentId], mat);
            } else {
                mesh = new THREE.Mesh(this.primitives[parentId], this.materials[material]);
            }
            mesh.castShadow = castshadows;
            mesh.receiveShadow = receiveshadows;
            return mesh;
        } else {
            const clone = this.lights[node.id].clone();
            if (this.lightClones[node.id] === undefined) {
                this.lightClones[node.id] = [];
            }
            this.lightClones[node.id].push(clone);
            return clone;
        }
    }

}

export { MyInitializer };