import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyInitializer } from "./yasf/MyInitializer.js";
import { MyBallon } from "./MyBalloon.js";
import { MyTrack } from "./MyTrack.js";
import { MyPowerUp } from "./MyPowerUp.js";
import { MyObstacle } from "./MyObstacle.js";
import { MyReliefImage } from "./MyReliefImage.js";

/**
 *  This class contains the contents of out application
 */
class MyContents {
  /**
       constructs the object
       @param {MyApp} app The application object
    */
  constructor(app) {
    this.app = app;
    this.axis = null;

    this.initializer = new MyInitializer(this.app, './yasf/scene.json', this.onAfterSceneLoadedAndBeforeRender.bind(this));
    this.balloon = new MyBallon(this.app, 2, 3);
    this.reliefImage = new MyReliefImage();
  }

  onAfterSceneLoadedAndBeforeRender() {
    const track = this.initializer.track;

    this.track = new MyTrack(
      this.app,
      track.powerups.map(pos => new MyPowerUp(this.app, pos)), 
      track.obstacles.map(pos => new MyObstacle(this.app, pos))
    );
    this.track.display();
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

    document.addEventListener('keydown', this.keyHandler.bind(this));

    // add a point light on top of the model
    const pointLight = new THREE.PointLight(0xffffff, 500, 0);
    pointLight.position.set(0, 20, 0);
    this.app.scene.add(pointLight);

    // add a point light helper for the previous point light
    const sphereSize = 0.5;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    this.app.scene.add(pointLightHelper);

    // add an ambient light
    const ambientLight = new THREE.AmbientLight(0x555555);
    this.app.scene.add(ambientLight);

    this.balloon.display();
  }

  keyHandler(event) {
    switch (event.key) {
      case 'w':
        this.balloon.up();
        break;
      case 's':
        this.balloon.down();
        break;
      default:
        break;
    } 
  }

  /**
   * updates the contents
   * this method is called from the render method of the app
   */
  update() {
    this.balloon.update();
  }
}

export { MyContents };
