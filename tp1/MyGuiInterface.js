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
        this.app = app;
        this.datgui =  new GUI();
        this.contents = null;
        this.cameraControllers = [];
        this.textureControllers = [];
        this.positionControllers = [];
        this.lightControllers = [];
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * Initialize the gui interface
     */
    init() {
        const data = {
            cakeSpotLightAngle: this.contents.spotLight.spotLight.angle * 180 / Math.PI,
        }

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Perspective2', 'Left', 'Right', 'Top', 'Front', 'Back' ] ).name("active camera")
            .onChange((value) => {
                this.cameraControllers.forEach((controller) => controller.object = this.app.cameras[value].position);
                this.cameraControllers.forEach((controller) => controller.updateDisplay());
            })
        // note that we are using a property from the app 
        this.cameraControllers.push(cameraFolder.add(this.app.activeCamera.position, 'x', -7, 7).name("x coord").onChange((value) => { 
            this.app.activeCamera.position.x = value; 
        }));
        this.cameraControllers.push(cameraFolder.add(this.app.activeCamera.position, 'y', 0, 10).name("y coord").onChange((value) => {
            this.app.activeCamera.position.y = value;
        }));
        this.cameraControllers.push(cameraFolder.add(this.app.activeCamera.position, 'z', -7, 25).name("z coord").onChange((value) => {
            this.app.activeCamera.position.z = value;
        }));
        cameraFolder.open()

        const cakeSpotLightFolder = this.datgui.addFolder('Cake Spotlight');
        cakeSpotLightFolder.addColor(this.contents.spotLight.spotLight, 'color').name("color").onChange((value) => { this.contents.spotLight.spotLight.color.set(value); this.contents.spotLight.endingMaterial.color.set(value); this.contents.spotLight.endingMaterial.emissive.set(value); });
        cakeSpotLightFolder.add(this.contents.spotLight.spotLight,'intensity', 0, 40).name("intensity (cd)");
        cakeSpotLightFolder.add(this.contents.spotLight.spotLight, 'distance', 0, 20).name("distance");
        cakeSpotLightFolder.add(data, 'cakeSpotLightAngle', 0, 180).name("angle").onChange((value) => { this.contents.spotLight.spotLight.angle = value * Math.PI / 180; });
        cakeSpotLightFolder.add(this.contents.spotLight.spotLight, 'penumbra', 0, 1).name("penumbra");
        cakeSpotLightFolder.add(this.contents.spotLight.spotLight, 'decay', 0, 2).name("decay");

        this.#roomPointLights();

        this.#paintings();
    }

    #roomPointLights() {
        const folder = this.datgui.addFolder('Ceiling Lights');

        this.#pointLight(this.contents.lamp2, 'Door Light', folder);
        this.#pointLight(this.contents.lamp1, 'Middle Light', folder);
        this.#pointLight(this.contents.lamp3, 'Cake Light', folder);
    }

    #pointLight(lamp, name, folder) {
        const entry = folder.addFolder(name);
        entry.close();
        entry.addColor(lamp.light, 'color').name("color").onChange((value) => { lamp.light.color.set(value); lamp.endingMaterial.color.set(value); lamp.endingMaterial.emissive.set(value); });
        entry.add(lamp.light,'intensity', 0, 100).name("intensity (cd)");        
        entry.add(lamp.light, 'distance', 0, 20).name("distance");
        entry.add(lamp.light, 'decay', 0, 10).name("decay");

        return entry;
    }

    #paintings() {
        const paintingsFolder = this.datgui.addFolder('Paintings');
        this.paintingLightFolder = null;

        paintingsFolder.add(this.contents, 'activePainting', ['Tomás', 'Mona Lisa', 'The Scream', 'Beetle', 
            'The Coronation of Napoleon', 'The Kiss', 'Girl with a Pearl Earring', 'The Starry Night', 'Henrique'])
            .name("Selected Painting").onChange((value) => {
                this.textureControllers[0].object = this.contents.paintings[value].materialIn.map;
                this.textureControllers[1].object = this.contents.paintings[value].materialIn.map;
                this.textureControllers[2].object = this.contents.paintings[value].materialIn.map.repeat;
                this.textureControllers[3].object = this.contents.paintings[value].materialIn.map.repeat;
                this.textureControllers[4].object = this.contents.paintings[value].materialIn.map.offset;
                this.textureControllers[5].object = this.contents.paintings[value].materialIn.map.offset;
                this.textureControllers[6].object = this.contents.paintings[value].materialIn.map;

                this.textureControllers.forEach((controller) => controller.updateDisplay());

                this.positionControllers.forEach((controller) => {
                    controller.object = this.contents.paintings[value].group.position;
                    controller.updateDisplay();
                });

                this.#updateGUI(paintingsFolder, value);
            });
        

        this.textureControllers.push(paintingsFolder.add(this.contents.paintings[this.contents.activePainting].materialIn.map, 'wrapS', {
            'Repeat': 1000,
            'Clamp to Edge': 1001,
            'Mirrored Repeat': 1002
        }).name("wrapModeU").onChange((value) => {
            this.contents.paintings[this.contents.activePainting].materialIn.map.wrapS = value;
            this.contents.paintings[this.contents.activePainting].materialIn.map.needsUpdate = true;
        }));
        this.textureControllers.push(paintingsFolder.add(this.contents.paintings[this.contents.activePainting].materialIn.map, 'wrapT', {
            'Repeat': 1000,
            'Clamp to Edge': 1001,
            'Mirrored Repeat': 1002
        }).name("wrapModeV").onChange((value) => {
            this.contents.paintings[this.contents.activePainting].materialIn.map.wrapT = value;
            this.contents.paintings[this.contents.activePainting].materialIn.map.needsUpdate = true
        }));
        this.textureControllers.push(paintingsFolder.add(this.contents.paintings[this.contents.activePainting].materialIn.map.repeat, 'x', 0, 10).name("repeatU")
            .onChange((value) => this.contents.paintings[this.contents.activePainting].materialIn.map.repeat.x = value));
        this.textureControllers.push(paintingsFolder.add(this.contents.paintings[this.contents.activePainting].materialIn.map.repeat, 'y', 0, 10).name("repeatV")
            .onChange((value) => this.contents.paintings[this.contents.activePainting].materialIn.map.repeat.y = value));
        this.textureControllers.push(paintingsFolder.add(this.contents.paintings[this.contents.activePainting].materialIn.map.offset, 'x', 0, 1).name("offsetU")
            .onChange((value) => this.contents.paintings[this.contents.activePainting].materialIn.map.offset.x = value));
        this.textureControllers.push(paintingsFolder.add(this.contents.paintings[this.contents.activePainting].materialIn.map.offset, 'y', 0, 1).name("offsetV")
            .onChange((value) => this.contents.paintings[this.contents.activePainting].materialIn.map.offset.y = value));
        this.textureControllers.push(paintingsFolder.add(this.contents.paintings[this.contents.activePainting].materialIn.map, 'rotationD', 0, 360).name("rotation")
            .onChange((value) => this.contents.paintings[this.contents.activePainting].materialIn.map.rotation = value *  Math.PI / 180));

        const positionsFolder = paintingsFolder.addFolder('Position');
        this.positionControllers.push(positionsFolder.add(this.contents.paintings[this.contents.activePainting].group.position, 'x', -2.5, 2.5).name("x coord")
            .onChange((value) => this.contents.paintings[this.contents.activePainting].group.position.x = value));
        this.positionControllers.push(positionsFolder.add(this.contents.paintings[this.contents.activePainting].group.position, 'y', -4.2, 2.65).name("y coord")
            .onChange((value) => this.contents.paintings[this.contents.activePainting].group.position.y = value));
        this.positionControllers.push(positionsFolder.add(this.contents.paintings[this.contents.activePainting].group.position, 'z', -20, 20).name("z coord")
            .onChange((value) => this.contents.paintings[this.contents.activePainting].group.position.z = value));

    }

    #updateGUI(paitingsFolder, value) {
        if (this.paintingLightFolder !== null) {
            this.paintingLightFolder.destroy();
        }

        if (value === 'The Coronation of Napoleon')
            return;

        this.paintingLightFolder = paitingsFolder.addFolder('Light');
        const painting = this.contents.paintings[this.contents.activePainting];
        const data = {
            angle: painting.spotLight.spotLight.angle * 180 / Math.PI
        };

        this.lightControllers.push(this.paintingLightFolder.addColor(painting.spotLight.spotLight, 'color').name("color")
            .onChange((value) => { painting.spotLight.spotLight.color.set(value); painting.spotLight.endingMaterial.color.set(value); painting.spotLight.endingMaterial.emissive.set(value); }));
        this.lightControllers.push(this.paintingLightFolder.add(painting.spotLight.spotLight, 'intensity', 0, 40).name("intensity (cd)")
            .onChange((value) => painting.spotLight.spotLight.intensity = value));
        this.lightControllers.push(this.paintingLightFolder.add(painting.spotLight.spotLight, 'distance', 0, 20).name("distance")
            .onChange((value) => painting.spotLight.spotLight.distance = value));
        this.lightControllers.push(this.paintingLightFolder.add(data, 'angle', 0, 180).name("angle")
            .onChange((value) => painting.spotLight.spotLight.angle = value * Math.PI / 180 ));
        this.lightControllers.push(this.paintingLightFolder.add(painting.spotLight.spotLight, 'penumbra', 0, 1).name("penumbra")
            .onChange((value) => painting.spotLight.spotLight.penumbra = value));
        this.lightControllers.push(this.paintingLightFolder.add(painting.spotLight.spotLight, 'decay', 0, 2).name("decay")
            .onChange((value) => painting.spotLight.spotLight.decay = value));
    }
}

export { MyGuiInterface };