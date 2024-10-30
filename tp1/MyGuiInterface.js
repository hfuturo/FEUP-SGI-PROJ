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
            cakeSpotLightAngle: this.contents.spotLight.angle * 180 / Math.PI,
        }

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Perspective2', 'Left', 'Right', 'Top', 'Front', 'Back' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.open()

        const cakeSpotLightFolder = this.datgui.addFolder('Cake Spotlight');
        cakeSpotLightFolder.addColor(this.contents.spotLight, 'color').name("color").onChange((value) => { this.contents.spotLight.color.set(value); });
        cakeSpotLightFolder.add(this.contents.spotLight,'intensity', 0, 40).name("intensity (cd)");        
        cakeSpotLightFolder.add(this.contents.spotLight, 'distance', 0, 20).name("distance");
        cakeSpotLightFolder.add(data, 'cakeSpotLightAngle', 0, 180).name("angle").onChange((value) => { this.contents.spotLight.angle = value * Math.PI / 180; });
        cakeSpotLightFolder.add(this.contents.spotLight, 'penumbra', 0, 1).name("penumbra");
        cakeSpotLightFolder.add(this.contents.spotLight, 'decay', 0, 2).name("decay");

        this.#roomPointLights();
    }

    #roomPointLights() {
        const folder = this.datgui.addFolder('Ceiling Lights');

        this.#pointLight(this.contents.lamp2, 'Door Light', folder);
        this.#pointLight(this.contents.lamp1, 'Middle Light', folder);
        this.#pointLight(this.contents.lamp3, 'Cake Light', folder);
    }

    #pointLight(lamp, name, folder) {
        const entry = folder.addFolder(name);
        entry.addColor(lamp.light, 'color').name("color").onChange((value) => { lamp.light.color.set(value); lamp.endingMaterial.color.set(value); lamp.endingMaterial.emissive.set(value); });
        entry.add(lamp.light,'intensity', 0, 100).name("intensity (cd)");        
        entry.add(lamp.light, 'distance', 0, 20).name("distance");
        entry.add(lamp.light, 'decay', 0, 10).name("decay");

        return entry;
    }
}

export { MyGuiInterface };