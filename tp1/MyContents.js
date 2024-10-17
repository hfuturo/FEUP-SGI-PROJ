import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';

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
        
        const wallMaterial = new THREE.MeshPhongMaterial({
            color: "#cac8be",
            specular: "#000000",
            emissive: "#000000",
            shininess: 0
        })

        this.wallMesh1 = new THREE.Mesh( plane, wallMaterial );
        this.wallMesh1.position.z = -5;
        this.wallMesh1.position.y = 5;
        this.app.scene.add( this.wallMesh1 );
        
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

    buildCake() {
        const cake = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32, 1, false, 0, Math.PI * 1.8);
        this.cakeMesh = new THREE.Mesh(cake, this.planeMaterial);
        this.cakeMesh.position.y = 3.1;
        this.app.scene.add(this.cakeMesh);

        // fill the inside of the cake where the slice is missing
        const slice = new THREE.PlaneGeometry(0.5, 0.5);
        this.sliceBlueAxisMesh = new THREE.Mesh(slice, this.planeMaterial);
        this.sliceBlueAxisMesh.position.y = 3.1;
        this.sliceBlueAxisMesh.rotation.y = -Math.PI / 2;
        this.sliceBlueAxisMesh.position.z = 0.25;
        this.app.scene.add(this.sliceBlueAxisMesh);

        this.sliceAngledMesh = new THREE.Mesh(slice, this.planeMaterial);
        this.sliceAngledMesh.position.y = 3.1;
        this.sliceAngledMesh.rotation.y = Math.PI * 2 - Math.PI * 1.7;
        this.sliceAngledMesh.position.x = Math.sin(Math.PI * 1.8) * 0.25;
        this.sliceAngledMesh.position.z = Math.cos(Math.PI * 1.8) * 0.25;
        this.app.scene.add(this.sliceAngledMesh);
    }

    buildCandle() {
        const candle = new THREE.CylinderGeometry(0.025, 0.025, 0.2);
        this.candleMesh = new THREE.Mesh(candle, this.planeMaterial);
        this.candleMesh.position.y = 3.4;
        this.app.scene.add(this.candleMesh);
    }

    buildFlame() {
        const flame = new THREE.ConeGeometry(0.025, 0.1);
        this.flameMesh = new THREE.Mesh(flame, this.planeMaterial);
        this.flameMesh.position.y = 3.5;
        this.app.scene.add(this.flameMesh);
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

        // add a point light on top of the model
        const pointLight = new THREE.PointLight( 0xffffff, 500, 0 );
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
        this.buildCake();
        this.buildCandle();
        this.buildFlame();
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
                this.app.scene.add(this.boxMesh)
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