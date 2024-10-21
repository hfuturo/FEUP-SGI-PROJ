import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyNurbsBuilder } from './MyNurbsBuilder.js'
import { MySpring } from './MySpring.js';
import { MyPainting } from './MyPainting.js';
import { MyBeetle } from './MyBeetle.js';
import { MyLandscape } from './MyLandscape.js';
import { MyCake } from './MyCake.js';
import { MyWindow } from './MyWindow.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null

        // box related attributes
        this.boxMesh = null
        this.boxMeshSize = 1.0
        this.boxEnabled = true
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0,2,0)

        // plane related attributes
        this.diffusePlaneColor = "#00ffff"
        this.specularPlaneColor = "#777777"
        this.planeShininess = 30
        this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, 
            specular: this.specularPlaneColor, emissive: "#000000", shininess: this.planeShininess })

        this.nurbsBuilder = new MyNurbsBuilder(this.app)
    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {    
        let boxMaterial = new THREE.MeshPhongMaterial({ color: "#ffff77", 
        specular: "#000000", emissive: "#000000", shininess: 90 })

        // Create a Cube Mesh with basic material
        let box = new THREE.BoxGeometry(  this.boxMeshSize,  this.boxMeshSize,  this.boxMeshSize );
        this.boxMesh = new THREE.Mesh( box, boxMaterial );
        // this.boxMesh.rotation.x = -Math.PI / 2;
        this.boxMesh.position.y = this.boxDisplacement.y;
    }

    buildWalls() {
        let plane = new THREE.PlaneGeometry( 10, 10 );
        const horizontalSubplane = new THREE.PlaneGeometry(10, 4);
        const verticalSubplane = new THREE.PlaneGeometry(2.5, 10);
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: "#cac8be",
            specular: "#000000",
            emissive: "#000000",
            shininess: 0
        })

        // build subwalls in this one to create a hole 
        this.wallMesh11 = new THREE.Mesh( horizontalSubplane, wallMaterial );
        this.wallMesh11.position.z = -5;
        this.wallMesh11.position.y = 8;
        this.app.scene.add( this.wallMesh11 );

        this.wallMesh12 = new THREE.Mesh( horizontalSubplane, wallMaterial );
        this.wallMesh12.position.z = -5;
        this.wallMesh12.position.y = 2;
        this.app.scene.add( this.wallMesh12 );

        this.wallMesh13 = new THREE.Mesh( verticalSubplane, wallMaterial );
        this.wallMesh13.position.x = -3.8;
        this.wallMesh13.position.z = -5;
        this.wallMesh13.position.y = 5;
        this.app.scene.add( this.wallMesh13 );

        this.wallMesh14 = new THREE.Mesh( verticalSubplane, wallMaterial );
        this.wallMesh14.position.x = 3.8;
        this.wallMesh14.position.z = -5;
        this.wallMesh14.position.y = 5;
        this.app.scene.add( this.wallMesh14 );
        
        this.wallMesh2 = new THREE.Mesh( plane, wallMaterial );
        this.wallMesh2.position.z = 5;
        this.wallMesh2.position.y = 5;
        this.wallMesh2.rotation.y = Math.PI;
        this.app.scene.add( this.wallMesh2 );

        this.wallMesh3 = new THREE.Mesh( plane, wallMaterial );
        this.wallMesh3.position.x = -5;
        this.wallMesh3.position.y = 5;
        this.wallMesh3.rotation.y = Math.PI / 2;
        this.app.scene.add( this.wallMesh3 );

        this.wallMesh4 = new THREE.Mesh( plane, wallMaterial );
        this.wallMesh4.position.x = 5;
        this.wallMesh4.position.y = 5;
        this.wallMesh4.rotation.y = -Math.PI / 2;
        this.app.scene.add( this.wallMesh4 );
    }

    buildTable() {

        let tableTop = new THREE.BoxGeometry(5, 0.5, 2.5);

        // TODO: check
        const woodTexture = new THREE.TextureLoader().load('textures/wood.jpg');
        woodTexture.wrapS = THREE.MirroredRepeatWrapping;
        woodTexture.repeat.set(2, 1);
        const tableTopMaterial = new THREE.MeshLambertMaterial({
            map: woodTexture
        })

        this.tableTopMesh = new THREE.Mesh(tableTop, tableTopMaterial);
        this.tableTopMesh.position.y = 2.5;
        this.app.scene.add(this.tableTopMesh);

        this.cylinder = new THREE.CylinderGeometry(0.25, 0.25, 2.5);

        const legMaterial = new THREE.MeshPhongMaterial({
            color: "#000000",
            specular: "#c4c4c4",
            emissive: "#000000",
            shininess: 0
        })

        this.leg1 = new THREE.Mesh(this.cylinder, legMaterial);
        this.leg1.position.x = -2;
        this.leg1.position.y = 1;
        this.leg1.position.z = -0.75;
        this.app.scene.add(this.leg1);

        this.leg2 = new THREE.Mesh(this.cylinder, legMaterial);
        this.leg2.position.x = 2;
        this.leg2.position.y = 1;
        this.leg2.position.z = -0.75;
        this.app.scene.add(this.leg2);

        this.leg3 = new THREE.Mesh(this.cylinder, legMaterial);
        this.leg3.position.x = -2;
        this.leg3.position.y = 1;
        this.leg3.position.z = 0.75;
        this.app.scene.add(this.leg3);

        this.leg4 = new THREE.Mesh(this.cylinder, legMaterial);
        this.leg4.position.x = 2;
        this.leg4.position.y = 1;
        this.leg4.position.z = 0.75;
        this.app.scene.add(this.leg4);
    }

    buildPlate() {
        let plate = new THREE.CylinderGeometry(0.75, 0.75, 0.25);
        this.plateMesh = new THREE.Mesh(plate, this.planeMaterial);
        this.plateMesh.position.y = 2.75;
        this.app.scene.add(this.plateMesh);
    }

    buildNewsPaper() {
        const controlPoints = [// U = 0
            [// V = 0..2
                [0, 0, 0, 1],
                [0.5, 0.5, 0, 1],
                [1, 0, 0, 1]
            ],
            // U = 1
            [// V = 0..2
                [0, 0, 1.4, 1],
                [0.5, 0.5, 1.4, 1],
                [1, 0, 1.4, 1]
            ],
        ]

        const texture = new THREE.TextureLoader().load('textures/newspaper.jpg');
        texture.rotation = Math.PI / 2;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        const newspaperMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            side: THREE.DoubleSide
        })

        const surface = this.nurbsBuilder.build(controlPoints, 1, 2, 8, 8, newspaperMaterial);

        const mesh = new THREE.Mesh(surface, newspaperMaterial);
        mesh.position.set(-2, 2.75, -0.5)
        this.app.scene.add(mesh);
    }

    buildJar() {
        const controlPoints = [// U = 0
            [// V = 0..4
                [0, 0, 0.25, 1],
                [0.25, 0, 0.25, Math.sqrt(2) / 2],
                [0.25, 0, 0, 1],
                [0.25, 0, -0.25, Math.sqrt(2) / 2],
                [0, 0, -0.25, 1]
            ],
            // U = 1
            [// V = 0..4
                [0, 0.75, 0.75, 1],
                [0.75, 0.75, 0.75, Math.sqrt(2) / 2],
                [0.75, 0.75, 0, 1],
                [0.75, 0.75, -0.75, Math.sqrt(2) / 2],
                [0, 0.75, -0.75, 1]
            ],
            // U = 2
            [// V = 0..4
                [0, 1.25, 0.25, 1],
                [0.25, 1.25, 0.25, Math.sqrt(2) / 2],
                [0.25, 1.25, 0, 1],
                [0.25, 1.25, -0.25, Math.sqrt(2) / 2],
                [0, 1.25, -0.25, 1]
            ],
            // U = 3
            [// V = 0..4
                [0, 1.5, 0.6, 1],
                [0.6, 1.5, 0.6, Math.sqrt(2) / 2],
                [0.6, 1.5, 0, 1],
                [0.6, 1.5, -0.6, Math.sqrt(2) / 2],
                [0, 1.5, -0.6, 1]
            ]
        ]

        const jarMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/uv_grid_opengl.jpg'),
            side: THREE.DoubleSide
        });

        const surface = this.nurbsBuilder.build(controlPoints, 3, 4, 8, 8, jarMaterial);

        const mesh1 = new THREE.Mesh(surface, jarMaterial);
        mesh1.position.set(0, 0, 3)
        this.app.scene.add(mesh1);

        const mesh2 = new THREE.Mesh(surface, jarMaterial);
        mesh2.position.set(0, 0, 3)
        mesh2.rotation.y = Math.PI;
        this.app.scene.add(mesh2);
    }

    buildFlower() {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.3, 0.5, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 1.25, 0)
        ])
        const tube = new THREE.TubeGeometry(curve, 20, 0.1);

        const mesh = new THREE.Mesh(tube, this.planeMaterial);
        mesh.position.set(0, 0, -3);
        this.app.scene.add(mesh);

        const receptacle = new THREE.SphereGeometry(0.2);
        const receptacleMesh = new THREE.Mesh(receptacle, this.planeMaterial);
        receptacleMesh.position.set(0, 1.25, -3);
        this.app.scene.add(receptacleMesh);

        const petalControlPoints = [// U = 0
            [// V = 0..1
                [0, 0, 0, 1],
                [0.25, 0, 0, 1]
            ],
            // U = 1
            [// V = 0..1
                [-0.1, 0.5, 0, 1],
                [0.35, 0.5, 0, 1]
            ],
            // U = 2
            [// V = 0..1
                [0.125, 0.75, 0, 1],
                [0.125, 0.75, 0, 1]
            ]
        ]
        const petalSurface = this.nurbsBuilder.build(petalControlPoints, 2, 1, 8, 8, this.planeMaterial);
        const petalMaterial = this.planeMaterial;
        petalMaterial.side = THREE.DoubleSide;

        for (let i = 0; i < Math.PI * 2; i += Math.PI / 4) {
            const petalMesh = new THREE.Mesh(petalSurface, petalMaterial);
            petalMesh.scale.set(0.5, 0.5, 0.5);
            petalMesh.position.set(-Math.sin(i)/10, 1.25 + Math.cos(i)/10, -3);
            petalMesh.rotation.z = i;
            this.app.scene.add(petalMesh);
        }

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

        const horizontalFaceFrameInfo = {width: 0.1, height: 0.1, depth: 1, rotation: [0, 0, 0]};
        const verticalFaceFrameInfo = {width: 0.1, height: 0.1, depth: 1.5, rotation: [Math.PI / 2, 0, 0]};
        const horizontalBeetleInfo = {width: 0.1, height: 0.1, depth: 3, rotation: [0, 0, 0]};
        const verticalBeetleInfo = {width: 0.1, height: 0.1, depth: 1.5, rotation: [Math.PI / 2, 0, 0]};
        const horizontalWindowInfo = {width: 0.1, height: 0.1, depth: 5.1, rotation: [0, Math.PI / 2, 0]};
        const verticalWindowInfo = {width: 0.1, height: 0.1, depth: 2, rotation: [Math.PI / 2, 0, 0]};
        
        const cake = new MyCake(this.app, 0.5, 0.5, 32, 1, Math.PI * 1.8, this.planeMaterial, [0, 3.1, 0]);
        const landscape = new MyLandscape(this.app, 24, 13.5, [0, 5, -10]);
        const window = new MyWindow(this.app, horizontalWindowInfo, verticalWindowInfo, [0, 5, -5]);
        const hPainting = new MyPainting(this.app, horizontalFaceFrameInfo, verticalFaceFrameInfo, [-4.95, 5.7, 2.5], "henrique.jpg", [0, Math.PI / 2, 0]);
        const tPainting = new MyPainting(this.app, horizontalFaceFrameInfo, verticalFaceFrameInfo, [-4.95, 5.7, -2.5], "tomas.jpg", [0, Math.PI / 2, 0]);
        const beetlePainting = new MyPainting(this.app, horizontalBeetleInfo, verticalBeetleInfo, [-4.95, 5.7, 0], "beetle_background.webp", [0, Math.PI / 2, 0]);
        const beetle = new MyBeetle(this.app, 100, 0.01, [0, Math.PI / 2, 0], this.planeMaterial);
        const spring = new MySpring(this.app, 30, 0.01, [1, 2.85, 1], [0, 0, -Math.PI / 2]);

        // add a point light on top of the model
        const pointLight = new THREE.PointLight( 0xffffff, 300, 0 );
        pointLight.position.set( 0, 20, 0 );
        this.app.scene.add( pointLight );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        this.app.scene.add( pointLightHelper );

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555 );
        this.app.scene.add( ambientLight );

        this.buildBox()
        
        // Create a Plane Mesh with basic material
        
        let plane = new THREE.PlaneGeometry( 10, 10 );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add( this.planeMesh );
        
        this.buildWalls();
        this.buildTable();
        this.buildPlate();
        cake.display();
        landscape.display();
        window.display();
        this.buildJar();
        this.buildNewsPaper();
        this.buildFlower();

        // pintura beetle
        beetlePainting.display();
        beetle.display();

        // pinturas das caras
        hPainting.display();
        tPainting.display();

        spring.display();
    }
    
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }
    
    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {  
            this.app.scene.remove(this.boxMesh)
        }
        this.buildBox();
        this.lastBoxEnabled = null
    }
    
    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled
            if (this.boxEnabled) {
                // this.app.scene.add(this.boxMesh)
            }
            else {
                this.app.scene.remove(this.boxMesh)
            }
        }
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // check if box mesh needs to be updated
        this.updateBoxIfRequired()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z
    }

}

export { MyContents };