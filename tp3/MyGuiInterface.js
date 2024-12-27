import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null

        this.homogeneous = true
        this.windControllers = []
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        this.general = this.datgui.addFolder('General')
        this.track = this.datgui.addFolder('Track')

        const wind = this.datgui.addFolder('Wind')
        wind.add(this, 'homogeneous').name('Homogeneous')
        this.windControllers.push(wind.add(this.contents.balloon.wind, 'north', 0, 10).name('North').onChange((val) => this.#changeHomogeneous(val)))
        this.windControllers.push(wind.add(this.contents.balloon.wind, 'south', 0, 10).name('South').onChange((val) => this.#changeHomogeneous(val)))
        this.windControllers.push(wind.add(this.contents.balloon.wind, 'east', 0, 10).name('East').onChange((val) => this.#changeHomogeneous(val)))
        this.windControllers.push(wind.add(this.contents.balloon.wind, 'west', 0, 10).name('West').onChange((val) => this.#changeHomogeneous(val)))

        this.datgui.add(this.contents, 'reliefRefresh', 1, 60, 1).name('Relief Image Refresh (s)')
    }

    #changeHomogeneous(val) {
        if (this.homogeneous) {
            this.contents.balloon.wind.north = val
            this.contents.balloon.wind.south = val
            this.contents.balloon.wind.east = val
            this.contents.balloon.wind.west = val

            this.windControllers.forEach(controller => controller.updateDisplay());
        }
    }

    finish() {
        this.track.add(this.contents.track, 'scale', 5, 20, 1).name('Scale').onChange((val) => this.contents.track.updateTrack(val, undefined))
        this.track.add(this.contents.track, 'width', 1, 30, 5).name('Width').onChange((val) => this.contents.track.updateTrack(undefined, val))

        this.cameraController = this.general.add(this.app, 'activeCameraName', Object.keys(this.app.cameras) ).name("Camera").onChange((val) => {
            this.app.setActiveCamera(val);
            if (val === 'balloon') {
                if (this.contents.balloonCamera === '1') {
                    this.contents.balloonFirstPerson();
                } else if (this.contents.balloonCamera === '3') {
                    this.contents.balloonThirdPerson();
                }
            } else {
                this.app.setupFixedCamera();
            }
        });
    }

    update() {
        if (this.cameraController)
            this.cameraController.updateDisplay();
    }
}

export { MyGuiInterface };