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
import { MySparkle } from "./MySparkle.js";
import { MyFirework } from "./MyFirework.js";
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

    this.wind = {
      north: 5,
      south: 5,
      east: 5,
      west: 5
    }

    this.initializer = new MyInitializer(this.app, './yasf/scene.json', this.onAfterSceneLoadedAndBeforeRender.bind(this));

    this.reliefImage = new MyReliefImage(this.app);
    this.reliefRefresh = 60;
    this.reliefClock = new THREE.Clock();

    this.state = state.START;
    this.acceptingInputs = false;
    this.playerBalloon = undefined;
    this.opponentBalloon = undefined;
    this.numLaps = 1;
    this.username = '';
    this.highlight = null;

    this.balloonCamera = '3';

    this.sparkles = [];
    this.fireworks = [];

    THREE.DefaultLoadingManager.onLoad = () => {
      this.lastReliefRefresh = this.reliefRefresh;
    };

    this.billBoards = [];
    this.taggedObjects = [];
  }

  onAfterSceneLoadedAndBeforeRender() {
    this.loadTrack();
    this.loadBillBoards();
    this.loadParkingLots();

    this.sparklesObj = this.initializer.objects["sparkles"].children;
    this.fireworksObj = this.initializer.objects["fireworks"].children;

    this.app.scene.add(this.initializer.objects["relief_display"]);

    this.app.gui.finish();
  }

  loadParkingLots() {
    const ballonsTransformations = this.initializer.balloons_transformations;

    this.parkingLot1 = new MyParkingLot(
      this.app, 
      new THREE.Vector3(-40, 0, 25), 
      Object.keys(ballonsTransformations).map((ballonId) => new MyBallon(this.app, ballonId, this.wind, ballonsTransformations))
    );
    
    this.parkingLot2 = new MyParkingLot(
      this.app, 
      new THREE.Vector3(-40, 0, -25), 
      Object.keys(ballonsTransformations).map((ballonId) => new MyBallon(this.app, ballonId, this.wind, ballonsTransformations))
    );

    this.parkingLot1.display();
    this.parkingLot2.display();
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

      bb.addPicture('textures/feup.png', 0, 18, 8, 0.3);

      const playerBalloon = [
        bb.createText('Player', -2.75, 4, 1.5, 0xffffff),
        bb.createPicture('textures/balloons/default.webp', 0, -1.25, 7),
      ]
      bb.addButton('player', -17.5, 27, 9, 12, playerBalloon)

      const opponentBalloon = [
        bb.createText('PC', -0.5, 4, 1.5, 0xffffff),
        bb.createPicture('textures/balloons/default.webp', 0, -1.25, 7),
      ]
      bb.addButton('pc', -7.5, 27, 9, 12, opponentBalloon)

      const laps = [
        bb.createText('Laps', -1.1, 1, 1, 0xffffff),
        bb.createText('1', 0, -0.75, 2.5, 0xffffff)
      ]
      bb.addButton('laps', 0.5, 27, 6, 4, laps)

      const lapsUp = [bb.createText('/\\', -0.5, 0, 1.5, 0xffffff)]
      bb.addButton('lapsUp', 0.5, 31, 6, 3, lapsUp)

      const lapsDown = [bb.createText('\\/', -0.5, 0, 1.5, 0xffffff)]
      bb.addButton('lapsDown', 0.5, 23, 6, 3, lapsDown)

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
      bb.startTimer(-10, 36, 4);
      bb.startLaps(this.numLaps, 15, 26, 3);
      bb.startLayer(-21, 29);
      bb.startVouchers(18, 30, 3);
      bb.startBalloonTracking(0, 25, 18);
      bb.updateBalloonTracking(this.startPos.x, this.startPos.z, this.startPos.x * -1, this.startPos.z);

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
  }

  startMenuPicker(intersects) {
    if (this.choosingBalloon) return;

    if (intersects.length > 0) {
      const name = intersects[0].object.name;
      if (name !== 'laps') {
        this.billBoards.forEach((billboard) => {
          if (this.highlight !== null) billboard.unHighlightButton(this.highlight);
          billboard.highlightButton(name);
        });
        this.highlight = name;
      }

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
      else if (name === 'lapsUp' || name === 'lapsDown') {
        this.changeNumLaps(name);
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
    this.acceptingInputs = true;

    this.app.setActiveCamera("balloon");
    this.pause = false;
    this.playerBalloon.setPosition(this.startPos);
    this.opponentBalloon.setPosition(new THREE.Vector3(this.startPos.x * -1, this.startPos.y, this.startPos.z));
    this.balloonThirdPerson();

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

          const pos1 = MyBillboard.createText('A', 10, 0xffffff);
          pos1.rotation.x = -Math.PI / 2;
          pos1.position.set(10, 0.3, 0);

          const pos2 = MyBillboard.createText('B', 10, 0xffffff);
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

                  const pos = billboard.createText(intersects[0].object.position.x > 0 ? 'A' : 'B', 4, -5, 1.5, 0xffffff);
                  billboard.addButtonElement('player', pos);

                  const oppPos = billboard.createText(intersects[0].object.position.x > 0 ? 'B' : 'A', 4, -5, 1.5, 0xffffff);
                  billboard.addButtonElement('pc', oppPos);
                })

                this.startPos = intersects[0].object.position;
                this.startPos.y = 0;

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
                pos = billboard.createText(this.startPos.x > 0 ? 'A' : 'B', 4, -5, 1.5, 0xffffff);
              else pos = billboard.createText(this.startPos.x > 0 ? 'B' : 'A', 4, -5, 1.5, 0xffffff);

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

  changeNumLaps(name) {
    setTimeout(() => {
      if (this.highlight !== null) {
        this.billBoards.forEach((billboard) => {
          billboard.unHighlightButton(this.highlight);
        });
      }
    }, 100);

    if (name === 'lapsUp' && this.numLaps < 99) {
      this.numLaps++;
    } else if (name === 'lapsDown' && this.numLaps > 1) {
      this.numLaps--;
    } else {
      return;
    }

    this.billBoards.forEach((billboard) => {
      let laps;
      if (this.numLaps < 10) laps = billboard.createText(this.numLaps.toString(), 0, -0.75, 2.5, 0xffffff);
      else laps = billboard.createText(this.numLaps.toString(), -1, -0.75, 2.5, 0xffffff);
      billboard.removeButtonElement('laps');
      billboard.addButtonElement('laps', laps);
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
        if (this.playerBalloon.up())
          this.billBoards.forEach((billboard) => billboard.updateLayer(1));
        break;
      case 's':
        if (this.playerBalloon.down())
          this.billBoards.forEach((billboard) => billboard.updateLayer(-1));
        break;
      case 'c':
        if (this.app.activeCameraName === 'balloon') {
          if (this.balloonCamera === '1') {
            this.balloonThirdPerson();
            this.balloonCamera = '3';
          } else if (this.balloonCamera === '3') {
            this.balloonFirstPerson();
            this.balloonCamera = '1';
          }
        }
        break;
      case ' ':
        this.pause = !this.pause;
        this.billBoards.forEach((billboard) => billboard.pauseTimer());
        break;
      default:
        break;
    }
  }

  balloonFirstPerson() {
    this.app.setupMovingCamera(0.1);
    const pos = this.playerBalloon.getPosition();
    this.app.lookAt["balloon"] = new THREE.Vector3(pos.x, pos.y + 0.75, pos.z);
    this.app.updateTarget();
  }

  balloonThirdPerson() {
    this.app.setupMovingCamera(15);
    const pos = this.playerBalloon.getPosition();
    this.app.lookAt["balloon"] = new THREE.Vector3(pos.x, pos.y + 5, pos.z);
    this.app.updateTarget();
  }

  /**
   * updates the contents
   * this method is called from the render method of the app
   */
  update() {
    if (this.fireworksObj) {
      this.#shootSparkles();
      this.#shootFireworks();
    }

    if (this.lastReliefRefresh === 0)
      this.#updateReliefImage();

    this.lastReliefRefresh += this.reliefClock.getDelta();
    if (this.lastReliefRefresh >= this.reliefRefresh) {
      this.lastReliefRefresh = 0;
      this.app.renderTarget = true;
    }

    if (this.state === state.PLAYING && !this.pause) {
      this.updatePlaying();
    }

    this.app.gui.update();
  }

  updatePlaying() {
    this.playerBalloon.update();

    this.billBoards.forEach((billboard) => {
      billboard.update()
      const playerPos = this.playerBalloon.getPosition();
      const opponentPos = this.opponentBalloon.getPosition();
      billboard.updateBalloonTracking(playerPos.x, playerPos.z, opponentPos.x, opponentPos.z);
  });

    this.#checkCollisions();
    this.#checkOffTrack();

    if (this.app.activeCameraName === 'balloon') {
      const pos = this.playerBalloon.getPosition();
      if (this.balloonCamera === '1') {
        this.app.lookAt["balloon"] = new THREE.Vector3(pos.x, pos.y + 0.75, pos.z);
        this.app.updateTarget();
      } else if (this.balloonCamera === '3') {
        this.app.lookAt["balloon"] = new THREE.Vector3(pos.x, pos.y + 5, pos.z);
        this.app.updateTarget();
      }
    }
  }

  #checkOffTrack() {
    const {closestPoint, offTrack} = this.track.isBalloonOffTrack(this.playerBalloon.getShadowPosition());

    if (offTrack) {
      this.playerBalloon.freezeAndReplace(closestPoint);
    }
  }

  #checkCollisions() {
    this.track.getObstacles().forEach((obstacle) => {
      if (!this.playerBalloon.collides(obstacle) || this.playerBalloon.collidedWith(obstacle)) return;

      if (this.playerBalloon.getVouchers() > 0) {
        this.billBoards.forEach((billboard) => billboard.updateVoucher(-1));
      }

      this.playerBalloon.handleCollision(obstacle);
    });

    this.track.getPowerUps().forEach((powerUp) => {
      if (!this.playerBalloon.collides(powerUp) || this.playerBalloon.collidedWith(powerUp)) return;

      this.billBoards.forEach((billboard) => billboard.updateVoucher(1));
      this.playerBalloon.handleCollision(powerUp);
    });
  }

  #shootFireworks() {
    this.fireworksObj.forEach((fireworkObj) => {
      if (Math.random() < 0.05) {
        this.fireworks.push(new MyFirework(this.app, fireworkObj.position));
      }
    });


    for (let i = 0; i < this.fireworks.length; i++) {
      if (this.fireworks[i].done) {
        this.fireworks.splice(i, 1);
        continue;
      }

      this.fireworks[i].update();
    }
  }

  #shootSparkles() {
    this.sparklesObj.forEach((sparkleObj) => {
      this.sparkles.push(new MySparkle(this.app, sparkleObj.position));
    });

    for (let i = 0; i < this.sparkles.length; i++) {
      if (this.sparkles[i].done) {
        this.sparkles.slice(i, 1);
        continue;
      }

      this.sparkles[i].update();
    }
  }

  #updateReliefImage() {
    this.reliefImage.getImage(this.app.targetDepth, this.app.targetRGB).then(mesh => {
      if (this.reliefMesh) {
        this.app.scene.remove(this.reliefMesh);
      }

      this.reliefMesh = mesh;
      this.reliefMesh.position.set(94, 18, 0);
      this.reliefMesh.rotation.y = -Math.PI / 2;
      this.app.scene.add(this.reliefMesh);
    });
  }
}

export { MyContents };
