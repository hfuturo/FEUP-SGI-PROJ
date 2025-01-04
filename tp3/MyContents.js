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
import { MyRoute } from "./MyRoute.js";

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

    this.highlight = null;

    this.sparkles = [];
    this.fireworks = [];

    // create the relief image after textures have loaded
    THREE.DefaultLoadingManager.onLoad = () => {
      this.lastReliefRefresh = this.reliefRefresh;
    };
    // if textures take too long to load, create the relief image anyway
    setTimeout(() => {
      THREE.DefaultLoadingManager.onLoad = () => {};
      if (this.lastReliefRefresh === undefined) {
        this.lastReliefRefresh = this.reliefRefresh;
      }
    }, 2500);

    this.billBoards = [];
    this.taggedObjects = [];

    this.opponentLapTime = 70;
    this.penalty = 2000;
    this.boostersSparkles = [];
  }

  /**
   * Updates the penalty time (used by the GUI)
   * @param {number} val balloon penalty in seconds
   */
  updatePenalty(val) {
    this.penalty = val;
    this.playerBalloon.setPenalty(this.penalty);
    this.opponentBalloon.setPenalty(this.penalty);
  }

  /**
   * Performs actions that required the YASF scene to be loaded
   */
  onAfterSceneLoadedAndBeforeRender() {
    this.loadTrack();
    this.loadParkingLots();

    this.app.scene.add(this.initializer.objects["relief_display"]);

    this.changeState(state.START);

    this.app.gui.finish();
  }

  /**
   * Creates parking lot objects and displays them
   */
  loadParkingLots() {
    const ballonsTransformations = this.initializer.balloons_transformations;

    this.parkingLot1 = new MyParkingLot(
      this.app, 
      new THREE.Vector3(-80, 0, 25), 
      Object.keys(ballonsTransformations).map((ballonId) => new MyBallon(this.app, ballonId, this.wind, ballonsTransformations[ballonId]))
    );
    
    this.parkingLot2 = new MyParkingLot(
      this.app, 
      new THREE.Vector3(-80, 0, -25), 
      Object.keys(ballonsTransformations).map((ballonId) => new MyBallon(this.app, ballonId, this.wind, ballonsTransformations[ballonId]))
    );

    this.parkingLot1.display();
    this.parkingLot2.display();
  }

  /**
   * Loads the track and its components
   */
  loadTrack() {
    const track = this.initializer.track;

    this.track = new MyTrack(
      this.app,
      track.obstacles.map(pos => new MyObstacle(this.app, pos, this.initializer.objects["spike"].clone())),
      track.powerups.map(pos => new MyPowerUp(this.app, pos, this.initializer.objects["gift"].clone())),
    );
    this.track.display();

    this.routes = new MyRoute(this.app, track.routes);
    
    // remove the spike object from the yasf graph
    this.initializer.objects["spike"].parent.remove(this.initializer.objects["spike"]);
    this.initializer.objects["gift"].parent.remove(this.initializer.objects["gift"]);
  }

  /**
   * Loads the billboards/outdoors according to the current state
   */
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

  /**
   * Loads the billboards for the start state
   * This includes displaying the start menu, with game title, authors, balloons selection, laps selection, and username input
   */
  loadBillBoardsStart() {
    this.choosingBalloon = false;
    this.picker = new MyPicker(this.app, [], this.startMenuPicker.bind(this));
    const billboardObj = this.initializer.objects["out_billboards"];

    billboardObj.children.forEach((billboard) => {
      const bb = new MyBillboard(this.app, billboard.position, 3.2, billboard.rotation);
      bb.addText('Hot Air Kart', -16, 36, 4);

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

  /**
   * Loads the billboards for the playing state
   * This includes displaying the timer, laps, vouchers, balloon height information, and the map tracking the balloons
   */
  loadBillBoardsPlaying() {
    const billboardObj = this.initializer.objects["out_billboards"];

    billboardObj.children.forEach((billboard) => {
      const bb = new MyBillboard(this.app, billboard.position, 3.2, billboard.rotation);
      bb.startTimer(-10, 36, 4);
      bb.startLaps(this.numLaps, 15, 23, 3);
      bb.startLayer(-21, 29);
      bb.startVouchers(18, 30, 3);
      bb.startBalloonTracking(0, 25, 18);
      bb.updateBalloonTracking(this.startPos.x, this.startPos.z, this.startPos.x * -1, this.startPos.z);

      this.billBoards.push(bb);
    });
  }

  /**
   * Loads the billboards for the end state
   * This includes displaying the game over message, the timer, the player and PC balloons, the winner, the restart and exit buttons
   */
  loadBillBoardsEnd() {
    this.picker = new MyPicker(this.app, [], this.endMenuPicker.bind(this));

    const billboardObj = this.initializer.objects["out_billboards"];

    this.sparklesObj = [], this.fireworksObj = [];
    billboardObj.children.forEach((billboard) => {
      // load fireworks and sparkles
      this.sparklesObj.push(...billboard.children[1].children);
      this.fireworksObj.push(...billboard.children[2].children);

      const bb = new MyBillboard(this.app, billboard.position, 3.2, billboard.rotation);

      bb.addText('Game Over', -12, 36, 4);
      bb.addText(this.timer, -5, 33, 2);

      const playerBalloon = [
        bb.createText(this.username, -3.5, 4, 1.5, 0xffffff),
        bb.createPicture(`textures/balloons/${this.playerBalloon.name}.png`, 0, -1.25, 7),
      ]
      const playerColor = this.currLap === this.numLaps ? 0xffd700 : 0xff0000;
      bb.addButton('player', -12.75, 23, 10.5, 12, playerBalloon, playerColor);

      const opponentBalloon = [
        bb.createText('PC', -0.25, 4, 1.5, 0xffffff),
        bb.createPicture(`textures/balloons/${this.opponentBalloon.name}.png`, 0, -1.25, 7),
      ]
      const opponentColor = this.currLap === this.numLaps ? 0xff0000 : 0xffd700;
      bb.addButton('pc', -1.25, 23, 10.5, 12, opponentBalloon, opponentColor);

      const crownPos = this.currLap === this.numLaps ? -12 : -2;
      bb.addPicture('textures/crown.png', crownPos, 31, 5.5, 0.6);

      bb.addButton('restart', 10, 26, 5, 5, [bb.createPicture('textures/restart.png', 0, 0, 4)]);

      bb.addButton('exit', 10, 20, 5, 5, [bb.createPicture('textures/home.webp', 0, 0, 4)]);

      bb.buttonObjs.forEach((button) => this.picker.add(button.children[0]));
      this.billBoards.push(bb);
    });
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

    document.addEventListener('keydown', this.keyHandler.bind(this));
  }

  /**
   * Changes the state of the application and performs necessary setup based on the new state.
   * 
   * @param {string} newState - The new state to transition to. Possible values are `state.START`, `state.PLAYING`, and `state.END`.
   */
  changeState(newState) {
    this.state = newState;

    if (newState === state.START) {
      this.app.setActiveCamera("billboard");
      this.app.setupFixedCamera();

      if (this.playerBalloon) { // place the balloon back in the parking lot
        this.parkingLot1.returnBalloon(this.playerBalloon);

        if (this.opponentBalloon.balloonAnimation.isPlaying())
          this.opponentBalloon.balloonAnimation.stopAnimation();

        this.parkingLot2.returnBalloon(this.opponentBalloon);
      }

      this.acceptingInputs = false;
      this.playerBalloon = undefined;
      this.opponentBalloon = undefined;
      this.startPos = undefined;
      this.balloonCamera = '3';
      this.numLaps = 1;
      this.username = '';

      if (this.picker)
        this.picker.dispose();
    }
    else if (newState === state.PLAYING) {
      this.app.setActiveCamera("balloon");
      this.balloonThirdPerson();
      this.picker.dispose();

      this.acceptingInputs = true;
      this.pause = false;
      this.checkpoint = false;
      this.currLap = 0;
      this.playerBalloon.height = 0;
  
      this.playerBalloon.setPosition(this.startPos);

      if (this.opponentBalloon.balloonAnimation.isPlaying()) {
        this.opponentBalloon.balloonAnimation.stopAnimation();
      }
      this.opponentBalloon.setPosition(new THREE.Vector3(this.startPos.x * -1, this.startPos.y, this.startPos.z));
      this.opponentBalloon.animateAutonomous(this.routes.getRoute(this.opponentBalloon.name), this.opponentLapTime, this.numLaps);
      this.balloonThirdPerson();

      document.getElementById('hud').style.visibility = 'visible';
      document.getElementById('laps').getElementsByTagName('p')[1].innerText = `0/${this.numLaps}`;
    }
    else if (newState === state.END) {
      document.getElementById('hud').style.visibility = 'hidden';
      this.timer = this.billBoards[0].stopTimer();
      this.app.setActiveCamera("billboard");
      this.app.setupFixedCamera();
      this.picker.dispose();
    }

    this.loadBillBoards();
  }

  /**
   * Handles the selection of items for the initial menu based on the provided intersects array.
   * 
   * @param {Array} intersects - An array of intersected objects from a raycaster.
   */
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

  /**
   * Logic associated with the START button
   * Checks if all conditions for starting the game are met and changes the state to `state.PLAYING` if so.
   */
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

    this.changeState(state.PLAYING);
  }

  /**
   * Logic associated with the input of the username
   * Setting acceptingInputs to true will display letters on the screen and allow the user to input their username
   */
  insertName() {
    this.acceptingInputs = true;
  }

  /**
   * Chooses a balloon for the given player or opponent and sets up the scene accordingly.
   * 
   * @param {string} name - The name of the entity choosing the balloon ('player' or 'opponent').
   * @returns {Promise<void>} A promise that resolves when the balloon selection process is complete.
   */
  chooseBalloon(name) {
    return new Promise((resolve) => {      
      /**
       * This is the callback for the parking lot picker.
       * It is responsible for updating the billboards with the selected balloon and starting position.
       *
       * @param {Object} ballon - The balloon object that is selected.
       */
      const selectedBalloon = (ballon) => {
        this.billBoards.forEach((billboard) => {
          billboard.removeButtonElement(name);

          if (this.startPos) {
            billboard.removeButtonElement(name)
          }

          const picture = billboard.createPicture(`./textures/balloons/${ballon.name}.png`, 0, -1.25, 7);
          billboard.addButtonElement(name, picture);
        });

        // If the player balloon if being chosen, the starting position of the balloons is also chosen
        if (name === 'player') {
          this.playerBalloon = ballon;
          this.app.setActiveCamera("grid_selection")
          this.app.setupFixedCamera();

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
          // Create a picker to select the starting position
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
                this.app.setupFixedCamera();
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
          // If a starting position is already chosen, display the starting positions on the billboards
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
          this.app.setupFixedCamera();
          resolve();
        }
      }

      if (name === 'player') {
        this.app.setActiveCamera("parking_lot1");
        this.app.setupFixedCamera();
        this.parkingLot1.initPicker();
        this.parkingLot1.setCallback(selectedBalloon);
      } else {
        this.app.setActiveCamera("parking_lot2");
        this.app.setupFixedCamera();
        this.parkingLot2.initPicker();
        this.parkingLot2.setCallback(selectedBalloon);
      }
    });
  }

  /** 
   * If the name is 'lapsUp' and the current number of laps is less than 99, it increments the number of laps.
   * If the name is 'lapsDown' and the current number of laps is greater than 1, it decrements the number of laps.
   * 
   * Updates the billboard elements to reflect the new number of laps.
   * 
   * @param {string} name - The name indicating the button that was pressed ('lapsUp' or 'lapsDown').
   */
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

  /**
   * Handles the end menu selection based on the intersected objects.
   * If the intersected object's name is 'restart', it changes the state to PLAYING.
   * If the intersected object's name is 'exit', it changes the state to START.
   * Resets all fireworks and sparkles, then clears the arrays.
   *
   * @param {Array} intersects - Array of intersected objects.
   */
  endMenuPicker(intersects) {
    if (intersects.length > 0) {
      const name = intersects[0].object.name;
      if (name === 'restart') {
        this.changeState(state.PLAYING);
      }
      else if (name === 'exit') {
        this.changeState(state.START);
      }

      this.fireworks.forEach((firework) => firework.reset());
      this.sparkles.forEach((sparkle) => sparkle.reset());

      this.fireworks = [];
      this.sparkles = [];
    }
  }

  /**
   * Handles key events based on the current state of the application.
   * 
   * @param {KeyboardEvent} event - The keyboard event object.
   */
  keyHandler(event) {
    if (!this.acceptingInputs) return;

    if (this.state === state.START) this.keyHandlerStart(event);
    else if (this.state === state.PLAYING) this.keyHandlerPlaying(event);
  }

  /**
   * Handles keyboard events for updating the username (the only scenario in which the keyboard is used for the start state).
   * 
   * @param {KeyboardEvent} event - The keyboard event triggered by user input.
   * 
   * Key bindings:
   * - 'a' to 'z': Appends the corresponding letter to the username if the username length is less than 8.
   * - 'Backspace': Removes the last character from the username.
   * - 'Enter' or 'Escape': Deselect username input option (stops receiving inputs).
   */
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

  /**
   * Handles key events when the game is in the playing state.
   *
   * @param {KeyboardEvent} event - The keyboard event triggered by the user.
   * 
   * Key bindings:
   * - 'w': Moves the player balloon up and updates the layer of all billboards.
   * - 's': Moves the player balloon down and updates the layer of all billboards.
   * - 'c': Toggles between first-person and third-person camera views if the active camera is the balloon camera.
   * - ' ': Pauses or resumes the game and toggles the visibility of the pause indicator.
   * - 'h': Toggles the visibility of the HUD.
   */
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
        document.getElementById('pause').style.visibility = this.pause ? 'visible' : 'hidden';
        break;
      case 'h':
        document.getElementById('hud').style.visibility = document.getElementById('hud').style.visibility === 'visible' ? 'hidden' : 'visible';
        break;
      default:
        break;
    }
  }

  /**
   * Sets up the camera to follow the player's balloon in first-person view.
   * If no balloon is selected, a warning is logged to the console.
   */
  balloonFirstPerson() {
    if (this.playerBalloon === undefined) {
      console.warn('No balloon selected');
      return;
    }

    this.app.setupMovingCamera(0.1);
    const pos = this.playerBalloon.getPosition();
    this.app.lookAt["balloon"] = new THREE.Vector3(pos.x, pos.y + this.playerBalloon.basketHeight, pos.z);
    this.app.updateTarget();
  }

  /**
   * Adjusts the camera to a third-person view following the player's balloon.
   * If no balloon is selected, a warning is logged to the console.
   */
  balloonThirdPerson() {
    if (this.playerBalloon === undefined) {
      console.warn('No balloon selected');
      return;
    }

    this.app.setupMovingCamera(15);
    const pos = this.playerBalloon.getPosition();
    this.app.lookAt["balloon"] = new THREE.Vector3(pos.x, pos.y + 5, pos.z);
    this.app.updateTarget();
  }

  /**
   * Checks if it is necessary to update the relief image.
   * Delegates other updates to state specific methods and object specific methods.
   */
  update() {
    if (this.track) {
      this.track.update();
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

    if (this.state === state.END) {
      this.#shootSparkles();
      this.#shootFireworks();
    }

    if (this.parkingLot1 && this.parkingLot2)
      this.updateBoosters();

    this.app.gui.update();
  }

  /**
   * Updates the boosters by creating new sparkles at the positions of parkingLot1 and parkingLot2,
   * and updating the existing sparkles. Removes sparkles that are marked as done.
   */
  updateBoosters() {
    const color = {
      "h": 0.12,
      "s": 0.96,
      "l": 0.71
    };

    const pl1 = this.parkingLot1.getPosition();
    const pos1 = new THREE.Vector3(pl1.x, pl1.y - 0.2, pl1.z);

    const pl2 = this.parkingLot2.getPosition();
    const pos2 = new THREE.Vector3(pl2.x, pl2.y - 0.2, pl2.z);

    this.boostersSparkles.push(new MySparkle(this.app, pos1, 1, true, color));
    this.boostersSparkles.push(new MySparkle(this.app, pos2, 1, true, color));

    for (let i = 0; i < this.boostersSparkles.length; i++) {
      if (this.boostersSparkles[i].done) {
        this.boostersSparkles.slice(i, 1);
        continue;
      }

      this.boostersSparkles[i].update();
    }
  }

  /**
   * Updates the playing state of the game.
   */
  updatePlaying() {
    this.playerBalloon.update();
    this.opponentBalloon.update();

    document.getElementById('timer').innerText = this.billBoards[0].displayTime;

    // check if player won/crossed checkpoint
    const position = this.playerBalloon.getPosition();
    if (position.z < 1 && position.z > -1) {
      if (position.x > this.track.middleX - this.track.width && position.x < this.track.middleX + this.track.width) {
        this.checkpoint = true;
      } else if (this.checkpoint) {
        this.checkpoint = false;
        this.currLap++;
        this.billBoards.forEach((billboard) => billboard.incrementLap());

        document.getElementById('laps').getElementsByTagName('p')[1].innerText = `${this.currLap}/${this.numLaps}`;

        if (this.currLap === this.numLaps) {
          this.changeState(state.END);
          return;
        } 
      }
    }

    // check if PC won
    if (!this.opponentBalloon.balloonAnimation.isPlaying()) {
      this.changeState(state.END);
      return;
    }

    this.billBoards.forEach((billboard) => {
      billboard.update()
      const playerPos = this.playerBalloon.getPosition();
      const opponentPos = this.opponentBalloon.getPosition();
      billboard.updateBalloonTracking(playerPos.x, playerPos.z, opponentPos.x, opponentPos.z);
  });

    this.#checkCollisions();
    this.#checkOffTrack();

    // update camera lookAt so it follows the balloon
    if (this.app.activeCameraName === 'balloon') {
      const pos = this.playerBalloon.getPosition();
      if (this.balloonCamera === '1') {
        this.app.lookAt["balloon"] = new THREE.Vector3(pos.x, pos.y + this.playerBalloon.basketHeight, pos.z);
        this.app.updateTarget();
      } else if (this.balloonCamera === '3') {
        this.app.lookAt["balloon"] = new THREE.Vector3(pos.x, pos.y + 5, pos.z);
        this.app.updateTarget();
      }
    }
  }

  /**
   * Checks if the player's balloon is off track and handles the consequences.
   * If the balloon is off track and the player has vouchers, it decrements the voucher count.
   * If the player has no vouchers, it freezes the balloon and replaces it at the closest point on the track.
   */
  #checkOffTrack() {
    const {closestPoint, offTrack} = this.track.isBalloonOffTrack(this.playerBalloon.getShadowPosition());

    if (offTrack) {
      if (this.playerBalloon.getVouchers() > 0) {
        document.getElementById('vouchers').getElementsByTagName('p')[0].innerText = this.playerBalloon.getVouchers() - 1;
        this.billBoards.forEach((billboard) => billboard.updateVoucher(-1));
      }
      this.playerBalloon.freezeAndReplace(closestPoint, this.penalty);
    }
  }

  /**
   * Checks for collisions between the player's balloon and obstacles, power-ups, and the opponent's balloon.
   */
  #checkCollisions() {
    this.track.getObstacles().forEach((obstacle) => {
      if (!this.playerBalloon.collides(obstacle) || this.playerBalloon.collidedWith(obstacle)) return;

      if (this.playerBalloon.getVouchers() > 0) {
        document.getElementById('vouchers').getElementsByTagName('p')[0].innerText = this.playerBalloon.getVouchers() - 1;
        this.billBoards.forEach((billboard) => billboard.updateVoucher(-1));
      }

      this.playerBalloon.handleCollision(obstacle);
    });

    this.track.getPowerUps().forEach((powerUp) => {
      if (!this.playerBalloon.collides(powerUp) || this.playerBalloon.collidedWith(powerUp)) return;

      this.billBoards.forEach((billboard) => billboard.updateVoucher(1));
      document.getElementById('vouchers').getElementsByTagName('p')[0].innerText = this.playerBalloon.getVouchers() + 1;
      this.playerBalloon.handleCollision(powerUp);
    });

    if (this.playerBalloon.collides(this.opponentBalloon)) {
      this.playerBalloon.handleCollision(this.opponentBalloon);
    }
  }

  /**
   * Handles the shooting of fireworks.
   * Iterates through the fireworks objects and randomly triggers new fireworks.
   * Updates the state of each firework and removes those that are done.
   */
  #shootFireworks() {
    this.fireworksObj.forEach((fireworkObj) => {
      if (Math.random() < 0.05) {
        const pos = new THREE.Vector3();
        fireworkObj.getWorldPosition(pos);

        this.fireworks.push(new MyFirework(this.app, pos));
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

  /**
   * Handles the shooting of sparkles.
   * Iterates through the sparkles objects and triggers new sparkles.
   * Updates the state of each sparkle and removes those that are done.
   */
  #shootSparkles() {
    this.sparklesObj.forEach((sparkleObj) => {
      const pos = new THREE.Vector3();
      sparkleObj.getWorldPosition(pos);
      this.sparkles.push(new MySparkle(this.app, pos));
    });

    for (let i = 0; i < this.sparkles.length; i++) {
      if (this.sparkles[i].done) {
        this.sparkles.slice(i, 1);
        continue;
      }

      this.sparkles[i].update();
    }
  }

  /**
   * Updates the relief image in the scene.
   * 
   * This method retrieves a new relief image based on the target depth and RGB values
   * from the application. If a relief mesh already exists, it removes it from the scene.
   * Then, it sets the new mesh's position and rotation, and adds it to the scene.
   */
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
