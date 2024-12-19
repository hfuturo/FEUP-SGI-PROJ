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
        const wind = this.datgui.addFolder('Wind')
        wind.add(this, 'homogeneous').name('Homogeneous')
        this.windControllers.push(wind.add(this.contents.balloon.wind, 'north', 0, 10).name('North').onChange((val) => this.#changeHomogeneous(val)))
        this.windControllers.push(wind.add(this.contents.balloon.wind, 'south', 0, 10).name('South').onChange((val) => this.#changeHomogeneous(val)))
        this.windControllers.push(wind.add(this.contents.balloon.wind, 'east', 0, 10).name('East').onChange((val) => this.#changeHomogeneous(val)))
        this.windControllers.push(wind.add(this.contents.balloon.wind, 'west', 0, 10).name('West').onChange((val) => this.#changeHomogeneous(val)))
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
    }
}

export { MyGuiInterface };