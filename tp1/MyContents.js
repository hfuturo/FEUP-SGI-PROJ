import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyNurbsBuilder } from './MyNurbsBuilder.js'
import { MySpring } from './MySpring.js';
import { MyPainting } from './MyPainting.js';
import { MyBeetle } from './MyBeetle.js';
import { MyLandscape } from './MyLandscape.js';
import { MyCake } from './MyCake.js';
import { MyWindow } from './MyWindow.js';
import { MyFlower } from './MyFlower.js';
import { MyJar } from './MyJar.js';
import { MyNewspaper } from './MyNewspaper.js';
import { MyPlate } from './MyPlate.js';
import { MyWall } from './MyWall.js';
import { MyTable } from './MyTable.js';

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
        const flower = new MyFlower(this.app, [0, 0, -3], 20, 0.1, this.planeMaterial, this.planeMaterial, this.planeMaterial,);
        const jar = new MyJar(this.app, this.planeMaterial, [0, 0, 3], [0, 0, 0], [1, 1, 1]);
        const newspaper = new MyNewspaper(this.app, [-2, 2.75, -0.5])
        const plate = new MyPlate(this.app, 0.75, 0.125, [0, 2.75 + 0.125/2, 0], this.planeMaterial)

        const wallMaterial = new THREE.MeshPhongMaterial({
            color: "#cac8be",
            specular: "#000000",
            emissive: "#000000",
            shininess: 0
        })
        const wall1 = new MyWall(this.app, 10, 10, [0, 5, -5], [0, 0, 0], wallMaterial, [2.5, 7.5, 4, 6]);
        const wall2 = new MyWall(this.app, 10, 10, [0, 5, 5], [0, Math.PI, 0], wallMaterial);
        const wall3 = new MyWall(this.app, 10, 10, [-5, 5, 0], [0, Math.PI / 2, 0], wallMaterial);
        const wall4 = new MyWall(this.app, 10, 10, [5, 5, 0], [0, -Math.PI / 2, 0], wallMaterial);

        const woodTexture = new THREE.TextureLoader().load('textures/wood.jpg');
        woodTexture.wrapS = THREE.MirroredRepeatWrapping;
        woodTexture.repeat.set(2, 1);
        const tableTopMaterial = new THREE.MeshLambertMaterial({
            map: woodTexture
        })
        const legMaterial = new THREE.MeshPhongMaterial({
            color: "#000000",
            specular: "#c4c4c4",
            emissive: "#000000",
            shininess: 0
        })
        
        const table = new MyTable(this.app, 5, 2.5, 2.625, 0.25, tableTopMaterial, legMaterial, [0, 0, 0]);

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
        
        wall1.display();
        wall2.display();
        wall3.display();
        wall4.display();
        table.display();
        plate.display();
        cake.display();
        landscape.display();
        window.display();
        jar.display();
        newspaper.display();
        flower.display();

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