import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MySpring } from './MySpring.js';
import { MyBeetle } from './MyBeetle.js';
import { MyLandscape } from './MyLandscape.js';
import { MyCake } from './MyCake.js';
import { MyFlower } from './MyFlower.js';
import { MyJar } from './MyJar.js';
import { MyNewspaper } from './MyNewspaper.js';
import { MyPlate } from './MyPlate.js';
import { MyWall } from './MyWall.js';
import { MyTable } from './MyTable.js';
import { MyBarrier } from './MyBarrier.js';
import { MyFrame } from './MyFrame.js';

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

        const frameMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/frame.jpg')
        })

        const windowMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/window_frame.jpg')
        })

        const henrique = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/henrique.jpg')
        })

        const tomas = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/tomas.jpg')
        })

        const glass = new THREE.MeshPhysicalMaterial({  
            map: new THREE.TextureLoader().load('textures/window.jpg'),
            roughness: 0,  
            transmission: 1,
        });

        const hPainting = new MyFrame(this.app, 1, 1, 0.1, [2.5, 5.75, -7.49], [0, Math.PI/2, 0], frameMaterial, henrique);
        const tPainting = new MyFrame(this.app, 1, 1, 0.1, [-2.5, 5.75, -7.49], [0, Math.PI/2, 0], frameMaterial, tomas);
        const window = new MyFrame(this.app, 5, 4, 0.1, [0, 5, -5], [0, 0, 0], windowMaterial, glass);

        const beetleFrame = new MyFrame(this.app, 3, 1.5, 0.1, [0, 5.75, -4.99], [0, Math.PI/2, 0], frameMaterial, new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('textures/beetle_background.webp')}));
        const beetle = new MyBeetle(this.app, 100, 0.01, [0, Math.PI / 2, 0], this.planeMaterial);
        
        const cake = new MyCake(this.app, 0.5, 0.5, 32, 1, Math.PI * 1.8, this.planeMaterial, [0, 3.1, 0]);
        const landscape = new MyLandscape(this.app, 24, 13.5, [0, 5, -10]);
        const spring = new MySpring(this.app, 20, 13, 0.1, [1, 2.85, 1], [0, 0, -Math.PI / 2]);
        const flower = new MyFlower(this.app, [0, 0, -3], 20, 0.1, this.planeMaterial, this.planeMaterial, this.planeMaterial,);
        const newspaper = new MyNewspaper(this.app, [-2, 2.75, -0.5])
        const plate = new MyPlate(this.app, 0.75, 0.125, [0, 2.75 + 0.125/2, 0], this.planeMaterial)

        const wallMaterial = new THREE.MeshPhongMaterial({
            color: "#cac8be",
            specular: "#000000",
            emissive: "#000000",
            shininess: 0
        })
        const wall1 = new MyWall(this.app, 15, 10, [0, 5, -5], [0, 0, 0], wallMaterial, [5, 10, 3, 7]);
        const wall2 = new MyWall(this.app, 15, 10, [0, 5, 20], [0, Math.PI, 0], wallMaterial);
        const wall3 = new MyWall(this.app, 25, 10, [-7.5, 5, 7.5], [0, Math.PI / 2, 0], wallMaterial);
        const wall4 = new MyWall(this.app, 25, 10, [7.5, 5, 7.5], [0, -Math.PI / 2, 0], wallMaterial);

        const floorMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/floor.png')
        });
        const floor = new MyWall(this.app, 15, 25, [0, 0, 7.5], [-Math.PI/2, 0, 0], floorMaterial);

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

        const jarTexture = new THREE.TextureLoader().load('textures/pattern.png')
        jarTexture.wrapS = THREE.RepeatWrapping;
        jarTexture.wrapT = THREE.RepeatWrapping;
        jarTexture.repeat.set(5, 5);
        const jarMaterial = new THREE.MeshLambertMaterial({
            map: jarTexture
        })
        const dirtTexture = new THREE.TextureLoader().load('textures/dirt.jpg')
        const dirtMaterial = new THREE.MeshLambertMaterial({
            map: dirtTexture
        })
        
        jarMaterial.side = THREE.DoubleSide;
        const jar = new MyJar(this.app, jarMaterial, dirtMaterial, [0, 0, 3], [0, 0, 0], [1, 1, 1]);

        const barrier = new MyBarrier(this.app, [3, 0, 0], Math.PI/6, true);

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
        
        wall1.display();
        wall2.display();
        wall3.display();
        wall4.display();
        floor.display();
        table.display();
        plate.display();
        cake.display();
        landscape.display();
        jar.display();
        newspaper.display();
        flower.display();

        hPainting.display();
        tPainting.display();
        window.display();
        beetleFrame.display();
        beetle.display();

        spring.display();
        barrier.display();
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
    }

}

export { MyContents };