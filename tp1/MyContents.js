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
import { MyLamp } from './MyLamp.js';

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
            this.axis.visible = false;
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

        const napoleanMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/napolean.jpg')
        });

        const lampMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/lamp.jpeg')
        });


        const plateMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/plate.jpg')
        });

        
        this.paintings = [];
        this.paintings['The Coronation of Napoleon'] = new MyFrame(this.app, 10, 5, 0.1, [0, 6, -4.9], [0, 0, 0], frameMaterial, napoleanMaterial, true, false);
        // left paintings
        this.paintings['Tomás'] = new MyFrame(this.app, 3, 3, 0.1, [-16, 5.75, -7.49], [0, Math.PI/2, 0], frameMaterial, tomas);
        this.paintings['Mona Lisa'] = new MyFrame(this.app, 3, 3, 0.1, [-12, 5.75, -7.49], [0, Math.PI/2, 0], frameMaterial, monaLisaMaterial);
        this.paintings['The Scream'] = new MyFrame(this.app, 3, 3, 0.1, [-8, 5.75, -7.49], [0, Math.PI/2, 0], frameMaterial, screamMaterial);
        this.paintings['Beetle'] = new MyFrame(this.app, 4, 2, 0.1, [-4, 5.75, -7.49], [0, Math.PI/2, 0], frameMaterial, new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('textures/beetle_background.jpg')}));
        this.beetle = new MyBeetle(this.app, 100, 0.01, [-7.49, 5.2, 4], [0, Math.PI / 2, 0]);
        
        // right paintings
        this.paintings['The Kiss']  = new MyFrame(this.app, 3, 3, 0.1, [4, 5.75, -7.49], [0, -Math.PI/2, 0], frameMaterial, kissMaterial);
        this.paintings['Girl with a Pearl Earring'] = new MyFrame(this.app, 3, 3, 0.1, [8, 5.75, -7.49], [0, -Math.PI/2, 0], frameMaterial, girlMaterial);
        this.paintings['The Starry Night'] = new MyFrame(this.app, 3, 3, 0.1, [12, 5.75, -7.49], [0, -Math.PI/2, 0], frameMaterial, starryNightMaterial);
        this.paintings['Henrique'] = new MyFrame(this.app, 3, 3, 0.1, [16, 5.75, -7.49], [0, -Math.PI/2, 0], frameMaterial, henrique);

        this.activePainting = 'The Coronation of Napoleon';

        this.lamps = [];
        this.lamps['Middle'] = new MyLamp(this.app, [0, 9.93, 7], 50, lampMaterial);
        this.lamps['Door'] = new MyLamp(this.app, [0, 9.93, 17], 50, lampMaterial);
        this.lamps['Cake'] = new MyLamp(this.app, [0, 9.93, -3], 50, lampMaterial);
        this.activeLight = 'Middle';
        
        const cakeGlassInfo = {width: 1.6, height: 1.3, depth: 1.6, material: clean_glass};
        const cake = new MyCake(this.app, 0.5, 0.5, 32, 1, Math.PI * 1.8, [0, 3.1, 0], cakeGlassInfo);
        this.spotLight = cake.spotLight;
        cake.spotLight = this.spotLight;

        const landscape = new MyLandscape(this.app, 24, 16, [0, 5, 25], [0, Math.PI, 0]);

        const springGlassInfo = {width: 1.6, height: 0.7, depth: 1, material: clean_glass};
        const spring = new MySpring(this.app, 20, 13, 0.1, [2, 2.85, 0], springGlassInfo, [0, 0, -Math.PI / 2]);

        const newsPaperGlassInfo = {width: 2.6, height: 0.6, depth: 1.5, material: clean_glass};
        const newspaper = new MyNewspaper(this.app, [-2.5, 2.75, -0.65], newsPaperGlassInfo)
        const plate = new MyPlate(this.app, 0.75, 0.125, [0, 2.75 + 0.125/2, 0], plateMaterial)

        const wallMaterial = new THREE.MeshPhongMaterial({
            color: "#cac8be",
            specular: "#000000",
            emissive: "#000000",
            shininess: 0
        })
        const wall1 = new MyWall(this.app, 15, 10, [0, 5, -5], [0, 0, 0], wallMaterial, [], true);
        const wall2 = new MyWall(this.app, 25, 10, [-7.5, 5, 7.5], [0, Math.PI / 2, 0], wallMaterial);
        const wall3 = new MyWall(this.app, 25, 10, [7.5, 5, 7.5], [0, -Math.PI / 2, 0], wallMaterial);

        const doorTexture = new THREE.TextureLoader().load('textures/door.jpg');
        const doorMaterial = new THREE.MeshLambertMaterial({ map: doorTexture, side: THREE.DoubleSide });

        const door1 = new MyWall(this.app, 3.5, 7, [1.75, 3.5, 20], [0, Math.PI, 0], doorMaterial, [], false, true);

        const doorTexture2 = doorTexture.clone();
        doorTexture2.wrapS = THREE.RepeatWrapping;
        doorTexture2.repeat.set(-1, 1);
        const doorMaterial2 = new THREE.MeshLambertMaterial({ map: doorTexture2, side: THREE.DoubleSide });

        const wallMaterialDouble = wallMaterial.clone();
        wallMaterialDouble.side = THREE.DoubleSide;

        const door2 = new MyWall(this.app, 3.5, 7, [-1.75, 3.5, 20], [0, Math.PI, 0], doorMaterial2, [], false, true);
        const doorTop = new MyWall(this.app, 7, 3, [0, 8.5, 20], [0, Math.PI, 0], wallMaterialDouble, [], false, true);
        const doorLeft = new MyWall(this.app, 4, 10, [5.5, 5, 20], [0, Math.PI, 0], wallMaterialDouble, [1, 3, 2, 7], false, true);
        const doorRight = new MyWall(this.app, 4, 10, [-5.5, 5, 20], [0, Math.PI, 0], wallMaterialDouble, [1, 3, 2, 7], false, true);

        const window1 = new MyFrame(this.app, 2, 5, 0.1, [5.5, 4.5, -20], [0, Math.PI, 0], windowMaterial, clean_glass, false, false);
        const window2 = new MyFrame(this.app, 2, 5, 0.1, [-5.5, 4.5, -20], [0, Math.PI, 0], windowMaterial, clean_glass, false, false);

        const floorMaterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('textures/floor.png'),
        });

        const floor = new MyWall(this.app, 15, 25, [0, 0, 7.5], [-Math.PI/2, 0, 0], floorMaterial, [], true);

        const ceilingMaterial = floorMaterial.clone();
        ceilingMaterial.side = THREE.DoubleSide;
        const ceiling = new MyWall(this.app, 15, 25, [0, 10, 7.5], [Math.PI/2, 0, 0], ceilingMaterial, [], false, true);
        
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
        const jar1 = new MyJar(this.app, jarMaterial, dirtMaterial, [-6, 0, -3.5], [0, 0, 0], [2, 2, 2]);
        const jar2 = new MyJar(this.app, jarMaterial, dirtMaterial, [6, 0, -3.5], [0, 0, 0], [2, 2, 2]);

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

        const flower1 = new MyFlower(this.app, [-6.1, 1.8, -3.5], 20, 0.1, stemMaterial, receptacleMaterial, petalMaterial, 0, [2, 2, 2]);

        const petalMaterial2 = petalMaterial.clone();
        petalMaterial2.color = new THREE.Color("#ff38f5");
        const flower2 = new MyFlower(this.app, [6.1, 1.8, -3.5], 20, 0.1, stemMaterial, receptacleMaterial, petalMaterial2, Math.PI, [2, 2, 2]);

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
        newspaper.display();
        
        jar1.display();
        jar2.display();
        flower1.display();
        flower2.display();

        this.paintings['The Coronation of Napoleon'].display();

        this.paintings['Tomás'].display();
        this.paintings['Mona Lisa'].display();
        this.paintings['The Scream'].display();
        this.paintings['Beetle'].display();
        this.beetle.display();
        
        this.paintings['The Kiss'].display();
        this.paintings['Girl with a Pearl Earring'].display();
        this.paintings['The Starry Night'].display();
        this.paintings['Henrique'].display();

        spring.display();
        barriers.forEach((barrier) => barrier.display())

        this.lamps['Door'].display();
        this.lamps['Middle'].display();
        this.lamps['Cake'].display();
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