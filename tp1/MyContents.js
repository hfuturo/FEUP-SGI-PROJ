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
import { MyCarpet } from './MyCarpet.js';
import { MyLightsSupport } from './MyLightsSupport.js';

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
            this.axis = new MyAxis(this);
            this.app.scene.add(this.axis);
        }

        const frameMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/frame.jpg')
        });

        const windowMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/window_frame.jpg')
        });

        const henrique = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/henrique.jpg')
        });

        const tomas = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/tomas.jpg')
        });

        const glass = new THREE.MeshPhysicalMaterial({  
            map: new THREE.TextureLoader().load('textures/window.jpg'),
            roughness: 0,  
            transmission: 1,
        });

        const clean_glass = new THREE.MeshPhysicalMaterial({
            map: new THREE.TextureLoader().load('textures/clean_glass.webp'),
            roughness: 0,
            transmission: 1,
        });

        const monaLisaMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/mona_lisa.jpg')
        });

        const starryNightMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/starry_night.webp')
        });

        const screamMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/scream.jpg')
        });

        const girlMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/girl.jpg')
        });

        const kissMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/kiss.jpg')
        });

        const supportMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/support.jpg')
        });


        // left paintings
        const tPainting = new MyFrame(this.app, 3, 3, 0.1, [-16, 5.75, -7.49], [0, Math.PI/2, 0], frameMaterial, tomas);
        const monaLisa = new MyFrame(this.app, 3, 3, 0.1, [-12, 5.75, -7.49], [0, Math.PI/2, 0], frameMaterial, monaLisaMaterial);
        const scream = new MyFrame(this.app, 3, 3, 0.1, [-8, 5.75, -7.49], [0, Math.PI/2, 0], frameMaterial, screamMaterial);
        const beetleFrame = new MyFrame(this.app, 4, 2, 0.1, [-4, 5.75, -7.49], [0, Math.PI/2, 0], frameMaterial, new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('textures/beetle_background.jpg')}));
        const beetle = new MyBeetle(this.app, 100, 0.01, [-7.49, 5.2, 4], [0, Math.PI / 2, 0], this.planeMaterial);
        
        // right paintings
        const hPainting = new MyFrame(this.app, 3, 3, 0.1, [16, 5.75, -7.49], [0, -Math.PI/2, 0], frameMaterial, henrique);
        const starryNight = new MyFrame(this.app, 3, 3, 0.1, [12, 5.75, -7.49], [0, -Math.PI/2, 0], frameMaterial, starryNightMaterial);
        const girl = new MyFrame(this.app, 3, 3, 0.1, [8, 5.75, -7.49], [0, -Math.PI/2, 0], frameMaterial, girlMaterial);
        const kiss = new MyFrame(this.app, 3, 3, 0.1, [4, 5.75, -7.49], [0, -Math.PI/2, 0], frameMaterial, kissMaterial);

        const stemMaterial = new THREE.MeshLambertMaterial({ map: new THREE.TextureLoader().load('textures/stem.jpg') });

        const recptacleTexture = new THREE.TextureLoader().load('textures/receptacle.jpg');
        recptacleTexture.wrapS = THREE.RepeatWrapping;
        recptacleTexture.wrapT = THREE.RepeatWrapping;
        recptacleTexture.repeat.set(2, 2);
        const receptacleMaterial = new THREE.MeshLambertMaterial({ map:  recptacleTexture});

        const petalTexture = new THREE.TextureLoader().load('textures/petal.png');
        petalTexture.repeat.set(0.5, 0.5);
        petalTexture.offset.set(0, 0.25);
        const petalMaterial = new THREE.MeshLambertMaterial({ 
            color: "#38f5ff",
            map: petalTexture
        });
        petalMaterial.side = THREE.DoubleSide;

        const flower = new MyFlower(this.app, [-0.1, 0.9, 3], 20, 0.1, stemMaterial, receptacleMaterial, petalMaterial);

        
        const cakeGlassInfo = {width: 1.6, height: 1.3, depth: 1.6, material: clean_glass};
        const cake = new MyCake(this.app, 0.5, 0.5, 32, 1, Math.PI * 1.8, this.planeMaterial, [0, 3.1, 0], cakeGlassInfo);

        const landscape = new MyLandscape(this.app, 24, 13.5, [0, 5, 25], [0, Math.PI, 0]);

        const springGlassInfo = {width: 1.6, height: 0.7, depth: 1, material: clean_glass};
        const spring = new MySpring(this.app, 20, 13, 0.1, [2, 2.85, 0], springGlassInfo, [0, 0, -Math.PI / 2]);

        const newsPaperGlassInfo = {width: 2.6, height: 0.6, depth: 1.5, material: clean_glass};
        const newspaper = new MyNewspaper(this.app, [-2.5, 2.75, -0.65], newsPaperGlassInfo)
        const plate = new MyPlate(this.app, 0.75, 0.125, [0, 2.75 + 0.125/2, 0], this.planeMaterial)

        const wallMaterial = new THREE.MeshPhongMaterial({
            color: "#cac8be",
            specular: "#000000",
            emissive: "#000000",
            shininess: 0
        })
        const wall1 = new MyWall(this.app, 15, 10, [0, 5, -5], [0, 0, 0], wallMaterial);
        const wall2 = new MyWall(this.app, 25, 10, [-7.5, 5, 7.5], [0, Math.PI / 2, 0], wallMaterial);
        const wall3 = new MyWall(this.app, 25, 10, [7.5, 5, 7.5], [0, -Math.PI / 2, 0], wallMaterial);

        const doorTexture = new THREE.TextureLoader().load('textures/door.jpg');

        const door1 = new MyWall(this.app, 3.5, 7, [1.75, 3.5, 20], [0, Math.PI, 0], new THREE.MeshLambertMaterial({ map: doorTexture }));

        const doorTexture2 = doorTexture.clone();
        doorTexture2.wrapS = THREE.RepeatWrapping;
        doorTexture2.repeat.set(-1, 1);

        const door2 = new MyWall(this.app, 3.5, 7, [-1.75, 3.5, 20], [0, Math.PI, 0], new THREE.MeshLambertMaterial({ map: doorTexture2 }));
        const doorTop = new MyWall(this.app, 7, 3, [0, 8.5, 20], [0, Math.PI, 0], wallMaterial);
        const doorLeft = new MyWall(this.app, 4, 10, [5.5, 5, 20], [0, Math.PI, 0], wallMaterial, [1, 3, 2, 7]);
        const doorRight = new MyWall(this.app, 4, 10, [-5.5, 5, 20], [0, Math.PI, 0], wallMaterial, [1, 3, 2, 7]);

        const window1 = new MyFrame(this.app, 2, 5, 0.1, [5.5, 4.5, -20], [0, Math.PI, 0], windowMaterial, glass, false);
        const window2 = new MyFrame(this.app, 2, 5, 0.1, [-5.5, 4.5, -20], [0, Math.PI, 0], windowMaterial, glass, false);

        const floorMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/floor.png')
        });

        const floor = new MyWall(this.app, 15, 25, [0, 0, 7.5], [-Math.PI/2, 0, 0], floorMaterial);
        const ceiling = new MyWall(this.app, 15, 25, [0, 10, 7.5], [Math.PI/2, 0, 0], floorMaterial);
        const lightsSupport = new MyLightsSupport(this.app, supportMaterial);


        const carpet = new MyCarpet(this.app, 20, 8, [0, 0.01, 10], Math.PI/2);

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
        
        const table = new MyTable(this.app, 8, 2.5, 2.625, 0.25, tableTopMaterial, legMaterial, [0, 0, 0]);

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

        const barriers = [
            //right
            new MyBarrier(this.app, [4, 0, 6], Math.PI/2, true),
            new MyBarrier(this.app, [4, 0, 10], Math.PI/2, false),
            new MyBarrier(this.app, [4, 0, 14], Math.PI/2, false),
            new MyBarrier(this.app, [4, 0, 18], Math.PI/2, false),
            //left
            new MyBarrier(this.app, [-4, 0, 6], Math.PI/2, true),
            new MyBarrier(this.app, [-4, 0, 10], Math.PI/2, false),
            new MyBarrier(this.app, [-4, 0, 14], Math.PI/2, false),
            new MyBarrier(this.app, [-4.6, 0, 18 - 0.05], Math.PI/2 - Math.PI/20, false),
        ];

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

        door1.display();
        door2.display();
        doorTop.display();
        doorLeft.display();
        doorRight.display();
        window1.display();
        window2.display();

        floor.display();
        ceiling.display();
        lightsSupport.display();
        carpet.display();
        table.display();
        plate.display();
        cake.display();
        landscape.display();
        jar.display();
        newspaper.display();
        flower.display();

        tPainting.display();
        monaLisa.display();
        scream.display();
        beetleFrame.display();
        beetle.display();

        hPainting.display();
        starryNight.display();
        girl.display();
        kiss.display();

        spring.display();
        barriers.forEach((barrier) => barrier.display())
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