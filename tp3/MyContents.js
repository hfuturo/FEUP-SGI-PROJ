import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyInitializer } from "./yasf/MyInitializer.js";
import { MyBallon } from "./MyBalloon.js";
import { MyTrack } from "./MyTrack.js";
import { MyPowerUp } from "./MyPowerUp.js";
import { MyObstacle } from "./MyObstacle.js";
import { MyReliefImage } from "./MyReliefImage.js";
import { MyBillboard } from "./MyBillboard.js";
import { MyPicker } from "./MyPicker.js";
import { MyParkingLot } from "./MyParkingLot.js";

const state = {
  START: 0,
  PLAYING: 1,
  END: 2
}

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
    this.balloon = new MyBallon(this.app, '1');

    this.parkingLot1 = new MyParkingLot(this.app, new THREE.Vector3(-40, 0, 25), [new MyBallon(this.app, '1')]);
    this.parkingLot2 = new MyParkingLot(this.app, new THREE.Vector3(-40, 0, -25), [new MyBallon(this.app, '1')]);

    this.reliefImage = new MyReliefImage();
    this.reliefRefresh = 60;
    this.reliefClock = new THREE.Clock();

    this.state = state.START;
    this.acceptingInputs = false;
    this.playerBalloon = undefined;
    this.opponentBalloon = undefined;
    this.username = '';
    this.highlight = null;

    THREE.DefaultLoadingManager.onLoad = () => {
      this.lastReliefRefresh = this.reliefRefresh;
    };

    this.billBoards = [];
    this.taggedObjects = [];

    const l1 = new THREE.DirectionalLight(0xFFFFFF, 1);
    l1.position.set(250, 250, 250);
    const l1h = new THREE.DirectionalLightHelper(l1, 3);
    this.app.scene.add(l1);
    this.app.scene.add(l1h);


    const l2 = new THREE.DirectionalLight(0xFFFFFF, 2);
    l2.position.set(-250, 250, -250);
    const l2h = new THREE.DirectionalLightHelper(l2, 3);
    this.app.scene.add(l2);
    this.app.scene.add(l2h);
    

    const l3 = new THREE.DirectionalLight(0xFFFFFF, 0.6);
    l3.position.set(40, 50, 0);
    l3.target.position.set(40, 250, 0);
    const l3h = new THREE.DirectionalLightHelper(l3, 3);
    this.app.scene.add(l3);
    this.app.scene.add(l3h);


    const l4 = new THREE.DirectionalLight(0xFFFFFF, 1);
    l4.position.set(250, -250, 250);
    const l4h = new THREE.DirectionalLightHelper(l4, 3);
    this.app.scene.add(l4);
    this.app.scene.add(l4h);


    const l5 = new THREE.DirectionalLight(0xFFFFFF, 2);
    l5.position.set(-250, -250, -250);
    const l5h = new THREE.DirectionalLightHelper(l5, 3);
    this.app.scene.add(l5);
    this.app.scene.add(l5h);
  }

  onAfterSceneLoadedAndBeforeRender() {
    this.loadTrack();
    this.loadBillBoards();
  }

  loadTrack() {
    const track = this.initializer.track;

    this.track = new MyTrack(
      this.app,
      track.obstacles.map(pos => new MyObstacle(this.app, pos)),
      track.powerups.map(pos => new MyPowerUp(this.app, pos))
    );
    this.track.display();
  }

  loadBillBoards() {
    this.billBoards.forEach((billboard) => {
      billboard.clear();
      this.app.scene.remove(billboard);
    });
    this.billBoards = [];

    if (this.state === state.START) this.loadBillBoardsStart();
    else if (this.state === state.PLAYING) this.loadBillBoardsPlaying();
    else if (this.state === state.END) this.loadBillBoardsEnd();
  }

  loadBillBoardsStart() {
    this.choosingBalloon = false;
    this.picker = new MyPicker(this.app, [], this.startMenuPicker.bind(this));
    const billboardObj = this.initializer.objects["out_billboards"];

    billboardObj.children.forEach((billboard) => {
      const bb = new MyBillboard(this.app, billboard.position, 3.2, billboard.rotation);
      bb.addText('Game Name', -12, 36, 4);

      bb.addPicture('textures/henrique.jpg', 20, 18, 4);
      bb.addText('Henrique Silva', 7, 18, 1);

      bb.addPicture('textures/tomas.jpg', -20, 18, 4);
      bb.addText('Tomas Gaspar', -17, 18, 1);

      bb.addPicture('textures/feup.png', 0, 18, 4);

      const playerBalloon = [
        bb.createText('Player', -3.75, 4, 2, 0xffffff),
        bb.createPicture('textures/balloons/default.webp', 0, -1.25, 7),
      ]
      bb.addButton('player', -16, 27, 12, 12, playerBalloon)

      const opponentBalloon = [
        bb.createText('PC', -1, 4, 2, 0xffffff),
        bb.createPicture('textures/balloons/default.webp', 0, -1.25, 7),
      ]
      bb.addButton('pc', -3, 27, 12, 12, opponentBalloon)

      const nameInput = [
        bb.createText('Name', -2.25, 2.25, 2, 0xffffff),
        bb.createText('________', -6.5, -1.5, 2.5, 0xffffff),
        bb.createText(this.username, -6.5, -1, 2.5, 0xffffff),
      ]
      bb.addButton('name', 13, 29.25, 18, 7.5, nameInput)

      const start = [bb.createText('Start', -4.5, 0, 3, 0xffffff)]
      bb.addButton('start', 13, 23, 18, 4, start)

      bb.buttonObjs.forEach((button) => this.picker.add(button.children[0]));
      this.billBoards.push(bb);
    });
  }

  loadBillBoardsPlaying() {
    const billboardObj = this.initializer.objects["out_billboards"];

    billboardObj.children.forEach((billboard) => {
      const bb = new MyBillboard(this.app, billboard.position, 3.2, billboard.rotation);
      bb.startTimer(-13, 36, 5);
      bb.startLaps(-20, 30, 4);
      bb.startLayer(-20, 25, 4);
      bb.startVouchers(-20, 20, 4);

      this.billBoards.push(bb);
    });
  }

  loadBillBoardsEnd() {
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
    this.parkingLot1.display();
    this.parkingLot2.display();
  }

  startMenuPicker(intersects) {
    if (this.choosingBalloon) return;

    if (intersects.length > 0) {
      const name = intersects[0].object.name;
      this.billBoards.forEach((billboard) => {
        if (this.highlight !== null) billboard.unHighlightButton(this.highlight);
        billboard.highlightButton(name);
      });
      this.highlight = name;

      if (name === 'start') this.startGame();
      else if (name === 'name') this.insertName();
      else if (name === 'player' || name === 'pc') {
        this.choosingBalloon = true;
        this.chooseBalloon(name).then(() => {
          this.billBoards.forEach((billboard) => {
            this.choosingBalloon = false;
            billboard.unHighlightButton(name);
          });
        });
      }
    }
    else {
      this.acceptingInputs = false;
      if (this.highlight !== null) {
        this.billBoards.forEach((billboard) => {
          billboard.unHighlightButton(this.highlight);
        });
        this.highlight = null;
      }
    }
  }

  startGame() {
    const unhighlight = () => {
      setTimeout(() => {
        if (this.highlight !== null) {
          this.billBoards.forEach((billboard) => {
            billboard.unHighlightButton(this.highlight);
          });
        }
      }, 250);
    }

    if (this.playerBalloon === undefined) {
      this.billBoards.forEach((billboard) => {
        const warn = billboard.createText('Please select your balloon', -9, 20, 1, 0xff0000);
        billboard.addTempElement(warn);
      });
      unhighlight();
      return;
    }

    if (this.opponentBalloon === undefined) {
      this.billBoards.forEach((billboard) => {
        const warn = billboard.createText('Please select PC balloon', -9, 20, 1, 0xff0000);
        billboard.addTempElement(warn);
      });
      unhighlight();
      return;
    }

    if (this.username === '') {
      this.billBoards.forEach((billboard) => {
        const warn = billboard.createText('Please insert username', -7, 20, 1, 0xff0000);
        billboard.addTempElement(warn);
      });
      unhighlight();
      return;
    }

    this.picker.dispose();
    this.state = state.PLAYING;
    this.app.setActiveCamera("perspective");

    this.loadBillBoards();
  }

  insertName() {
    this.acceptingInputs = true;
  }

  chooseBalloon(name) {
    return new Promise((resolve) => {
      const selectedBalloon = (ballon) => {
        this.billBoards.forEach((billboard) => {
          billboard.removeButtonElement(name);

          if (this.startPos) {
            billboard.removeButtonElement(name)
          }

          const picture = billboard.createPicture(`./textures/balloons/${ballon.name}.jpg`, 0, -1.25, 7);
          billboard.addButtonElement(name, picture);
        });

        if (name === 'player') {
          this.playerBalloon = ballon;
          this.app.setActiveCamera("grid_selection")

          const pos1 = MyBillboard.createText('1', 10, 0xffffff);
          pos1.rotation.x = -Math.PI / 2;
          pos1.position.set(10, 0.3, 0);

          const pos2 = MyBillboard.createText('2', 10, 0xffffff);
          pos2.rotation.x = -Math.PI / 2;
          pos2.position.set(-10, 0.3, 0);

          const base1 = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.3, 10),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
          )
          base1.position.set(-10, 0.15, 0);

          const base2 = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.3, 10),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
          )
          base2.position.set(10, 0.15, 0);

          this.app.scene.add(base1);
          this.app.scene.add(base2);
          this.app.scene.add(pos1);
          this.app.scene.add(pos2);

          let highlighted;
          const picker = new MyPicker(this.app, [base1, base2], (intersects) => {
            if (intersects.length > 0) {
              if (highlighted && highlighted.uuid === intersects[0].object.uuid) {
                this.app.scene.remove(base1);
                this.app.scene.remove(base2);
                this.app.scene.remove(pos1);
                this.app.scene.remove(pos2);

                this.billBoards.forEach((billboard) => {
                  if (this.startPos)
                    billboard.removeButtonElement('pc');

                  const pos = billboard.createText(intersects[0].object.position.x > 0 ? '1' : '2', 5, -5, 2, 0xffffff);
                  billboard.addButtonElement('player', pos);

                  const oppPos = billboard.createText(intersects[0].object.position.x > 0 ? '2' : '1', 5, -5, 2, 0xffffff);
                  billboard.addButtonElement('pc', oppPos);
                })

                this.startPos = intersects[0].object.position;

                picker.dispose();
                this.app.setActiveCamera("billboard");
                resolve();
              } else {
                if (highlighted) {
                  highlighted.material.color.set(0x000000);
                }
                highlighted = intersects[0].object;
                highlighted.material.color.set(0xff0000);
              }
            } else {
              if (highlighted) {
                highlighted.material.color.set(0x000000);
                highlighted = null;
              }
            }
          });

        } else {
          if (this.startPos) {
            this.billBoards.forEach((billboard) => {
              let pos;
              if (name === 'player')
                pos = billboard.createText(this.startPos.x > 0 ? '1' : '2', 5, -5, 2, 0xffffff);
              else pos = billboard.createText(this.startPos.x > 0 ? '2' : '1', 5, -5, 2, 0xffffff);

              billboard.addButtonElement(name, pos);
            })
          }

          this.opponentBalloon = ballon;
          this.app.setActiveCamera("billboard");
          resolve();
        }
      }

      if (name === 'player') {
        this.app.setActiveCamera("parking_lot1");
        this.parkingLot1.initPicker();
        this.parkingLot1.setCallback(selectedBalloon);
      } else {
        this.app.setActiveCamera("parking_lot2");
        this.parkingLot2.initPicker();
        this.parkingLot2.setCallback(selectedBalloon);
      }
    });
  }

  keyHandler(event) {
    if (!this.acceptingInputs) return;

    if (this.state === state.START) this.keyHandlerStart(event);
    else if (this.state === state.PLAYING) this.keyHandlerPlaying(event);
  }

  keyHandlerStart(event) {
    const updateDisplay = () => {
      this.billBoards.forEach((billboard) => {
        const username = billboard.createText(this.username, -6.5, -1, 2.5, 0xffffff);
        billboard.removeButtonElement('name');
        billboard.addButtonElement('name', username);
      });
    }

    if (event.key >= 'a' && event.key <= 'z' && this.username.length < 8) {
      this.username += event.key;
      updateDisplay();
    }
    else if (event.key === 'Backspace') {
      this.username = this.username.slice(0, -1);
      updateDisplay();
    }
    else if (event.key === 'Enter' || event.key === 'Escape') {
      this.acceptingInputs = false;
      if (this.highlight !== null) {
        this.billBoards.forEach((billboard) => {
          billboard.unHighlightButton(this.highlight);
        });
      }
    }
  }

  keyHandlerPlaying(event) {
    switch (event.key) {
      case 'w':
        if (this.balloon.up())
          this.billBoards.forEach((billboard) => billboard.updateLayer(1));
        break;
      case 's':
        if (this.balloon.down())
          this.billBoards.forEach((billboard) => billboard.updateLayer(-1));
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

    if (this.track === undefined || this.track === null) return;

    this.track.getObstacles().forEach((obstacle) => {
      if (this.balloon.collides(obstacle)) {
        if (this.taggedObjects.includes(obstacle)) return;

        this.#tagObject(obstacle);
        this.billBoards.forEach((billboard) => billboard.updateVoucher(-1));
      }
    });

    this.track.getPowerUps().forEach((powerUp) => {
      if (this.balloon.collides(powerUp)) {
        if (this.taggedObjects.includes(powerUp)) return;

        this.#tagObject(powerUp);
        this.billBoards.forEach((billboard) => billboard.updateVoucher(1));
      }
    })

    if (this.lastReliefRefresh === 0)
      this.#updateReliefImage();

    this.lastReliefRefresh += this.reliefClock.getDelta();
    if (this.lastReliefRefresh >= this.reliefRefresh) {
      this.lastReliefRefresh = 0;
      this.app.renderTarget = true;
    }


    this.billBoards.forEach((billboard) => billboard.update());
  }

  #updateReliefImage() {
    this.reliefImage.getImage(this.app.targetDepth, this.app.targetRGB).then(mesh => {
      if (this.reliefMesh) {
        this.app.scene.remove(this.reliefMesh);
      }

      this.reliefMesh = mesh;
      this.reliefMesh.position.set(0, 10, 10);
      this.app.scene.add(this.reliefMesh);
    });
  }

  #tagObject(object) {
    this.taggedObjects.push(object);

    // removes object after 2 second
    setTimeout(() => this.#clearTaggedObject(object), 2000);
  }

  #clearTaggedObject(object) {
    this.taggedObjects = this.taggedObjects.filter((obj) => obj !== object);
  }
}

export { MyContents };
