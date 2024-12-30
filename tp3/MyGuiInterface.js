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
        this.reliefProportion = true
        this.windControllers = []
        this.reliefControllers = []
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
        this.windControllers.push(wind.add(this.contents.wind, 'north', 0, 10).name('North').onChange((val) => this.#changeHomogeneous(val)))
        this.windControllers.push(wind.add(this.contents.wind, 'south', 0, 10).name('South').onChange((val) => this.#changeHomogeneous(val)))
        this.windControllers.push(wind.add(this.contents.wind, 'east', 0, 10).name('East').onChange((val) => this.#changeHomogeneous(val)))
        this.windControllers.push(wind.add(this.contents.wind, 'west', 0, 10).name('West').onChange((val) => this.#changeHomogeneous(val)))

        const relief = this.datgui.addFolder('Relief');
        relief.add(this.contents, 'reliefRefresh', 1, 60, 1).name('Image Refresh (s)')
        relief.add(this.contents.reliefImage, 'scale', 0, 10, 1).name('Scale')
        relief.add(this, 'reliefProportion').name('Keep Proportions')
        this.reliefControllers.push(relief.add(this.contents.reliefImage, 'verticalDivisions', 100, 800, 100).name('Vertical Divisions').onChange((val) => this.#changeProportions(val, 'v')))
        this.reliefControllers.push(relief.add(this.contents.reliefImage, 'horizontalDivisions', 200, 1600, 100).name('Horizontal Divisions').onChange((val) => this.#changeProportions(val, 'h')))
    }

    #changeHomogeneous(val) {
        if (this.homogeneous) {
            this.contents.wind.north = val
            this.contents.wind.south = val
            this.contents.wind.east = val
            this.contents.wind.west = val

            this.windControllers.forEach(controller => controller.updateDisplay());
        }
    }

    #changeProportions(val, type) {
        if (this.reliefProportion) {
            if (type === 'v') {
                this.contents.reliefImage.horizontalDivisions = val * 2
                this.contents.reliefImage.verticalDivisions = val
            } else if (type === 'h') {
                this.contents.reliefImage.horizontalDivisions = val
                this.contents.reliefImage.verticalDivisions = val / 2
            }

            this.reliefControllers.forEach(controller => controller.updateDisplay());
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

        this.general.add(this.contents, 'penalty', 0, 10000).name('Penalty').onChange((val) => this.contents.updatePenalty(val));
    }

    update() {
        if (this.cameraController)
            this.cameraController.updateDisplay();
    }
}

export { MyGuiInterface };