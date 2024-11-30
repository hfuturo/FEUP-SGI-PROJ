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

        this.lightControllers = []
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
        const data = {
            wireframe: false
        }

        this.datgui.add(this.contents.axis, 'visible').name("Axis");

        this.datgui.add(data, 'wireframe').name('Wireframe').onChange((value) => {
            for (const mat in this.contents.materials) {
                if (this.contents.wireframe.includes(mat)) continue;
                
                this.contents.materials[mat].wireframe = value
            }
        });
    }

    finish() {
        this.#cameras();
        this.#lights();
    }

    #cameras() {
        const folder = this.datgui.addFolder('Camera')

        folder.add(this.app, 'activeCameraName', Object.keys(this.app.cameras) ).name("active camera")
    }

    #lights() {
        const folder = this.datgui.addFolder('Lights');

        folder.add(this.contents, 'activeLight', Object.keys(this.contents.lightClones)).name("Selected Light")
            .onChange((value) => {
                this.lightControllers.forEach((controller) => controller.destroy());
                this.lightControllers = [];

                this.contents.lightClones[value].forEach((clone, i) => {
                    this.lightControllers.push(folder.add(clone, 'visible').name(`${i+1}. on/off`));
                });
            });
        
        this.contents.lightClones[this.contents.activeLight].forEach((clone, i) => {
            this.lightControllers.push(folder.add(clone, 'visible').name(`${i+1}. on/off`));
        });
    }
}

export { MyGuiInterface };