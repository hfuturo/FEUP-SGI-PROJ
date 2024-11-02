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
        this.contents = null
        this.cameraControllers = []
        this.lightControllers = []
        this.textureControllers = []
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
            axis: false,
            cakeSpotLightAngle: this.contents.spotLight.spotLight.angle * 180 / Math.PI,
        }

        //toggle axis
        this.datgui.add(data, 'axis').name("Axis").onChange((value) => {
            this.contents.axis.visible = value;
        });

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

        folder.add(this.contents, 'activeLight', ['Door', 'Middle', 'Cake']).name("Selected Light")
            .onChange((value) => {
                this.lightControllers.forEach((controller) => controller.object = this.contents.lamps[value].light);
                this.lightControllers.forEach((controller) => controller.updateDisplay());
            });

        this.lightControllers.push(folder.addColor(this.contents.lamps[this.contents.activeLight].light, 'color').name("color")
            .onChange((value) => { 
                this.contents.lamps[this.contents.activeLight].light.color.set(value); 
                this.contents.lamps[this.contents.activeLight].endingMaterial.color.set(value); 
                this.contents.lamps[this.contents.activeLight].endingMaterial.emissive.set(value); 
            }));
        
        this.lightControllers.push(folder.add(this.contents.lamps[this.contents.activeLight].light,'intensity', 0, 100).name("intensity (cd)"));
        this.lightControllers.push(folder.add(this.contents.lamps[this.contents.activeLight].light, 'distance', 0, 20).name("distance"));
        this.lightControllers.push(folder.add(this.contents.lamps[this.contents.activeLight].light, 'decay', 0, 10).name("decay"));
    }

    #paintings() {
        const paintingsFolder = this.datgui.addFolder('Paintings');
        this.paintingLightFolder = null;
        this.paintingPositionFolder = null;

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

                this.#updatePaintingsGUI(paintingsFolder, value);
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
        
        this.#updatePaintingsGUI(paintingsFolder, this.contents.activePainting);
    }

    #updatePaintingsGUI(paitingsFolder, value) {
        if (this.paintingLightFolder !== null) {
            this.paintingLightFolder.destroy();
        }

        if (this.paintingPositionFolder !== null) {
            this.paintingPositionFolder.destroy();
        }

        const minMaxPos = {
            'Tomás': [0, 0.01, -4.2, 2.65, -19.4, 2.4],
            'Mona Lisa': [0, 0.01, -4.2, 2.65, -15.4, 6.4],
            'The Scream': [0, 0.01, -4.2, 2.65, -11.4, 10.4],
            'Beetle': [0, 0.01, -4.6, 3.15, -6.9, 13.9],
            'The Coronation of Napoleon': [-2.4, 2.4, -3.3, 1.4, 0, 0.01],
            'The Kiss': [-0.01, 0, -4.2, 2.65, -7.5, 14.4],
            'Girl with a Pearl Earring': [-0.01, 0, -4.2, 2.65, -11.5, 10.4],
            'The Starry Night': [-0.01, 0, -4.2, 2.65, -15.5, 6.4],
            'Henrique': [-0.01, 0, -4.2, 2.65, -19.5, 2.4],
        }

        const painting = this.contents.paintings[this.contents.activePainting];
        
        this.paintingPositionFolder = paitingsFolder.addFolder('Position');
        this.paintingPositionFolder.add(painting.group.position, 'x', minMaxPos[value][0], minMaxPos[value][1]).name("x coord")
            .onChange((val) => {
                if (value === 'Beetle') {
                    this.contents.beetle.group.position.x = this.contents.beetle.position[0] + val;
                }
            })
        this.paintingPositionFolder.add(painting.group.position, 'y', minMaxPos[value][2], minMaxPos[value][3]).name("y coord")
            .onChange((val) => {
                if (value === 'Beetle') {
                    this.contents.beetle.group.position.y = this.contents.beetle.position[1] + val;
                }
            })
        this.paintingPositionFolder.add(painting.group.position, 'z', minMaxPos[value][4], minMaxPos[value][5]).name("z coord")
            .onChange((val) => {
                if (value === 'Beetle') {
                    this.contents.beetle.group.position.z = this.contents.beetle.position[2] + val;
                }
            })

        if (value === 'The Coronation of Napoleon')
            return;

        this.paintingLightFolder = paitingsFolder.addFolder('Light');
        const data = {
            angle: painting.spotLight.spotLight.angle * 180 / Math.PI
        };

        this.paintingLightFolder.addColor(painting.spotLight.spotLight, 'color').name("color")
            .onChange((value) => { painting.spotLight.spotLight.color.set(value); painting.spotLight.endingMaterial.color.set(value); painting.spotLight.endingMaterial.emissive.set(value); });
        this.paintingLightFolder.add(painting.spotLight.spotLight, 'intensity', 0, 40).name("intensity (cd)")
            .onChange((value) => painting.spotLight.spotLight.intensity = value);
        this.paintingLightFolder.add(painting.spotLight.spotLight, 'distance', 0, 20).name("distance")
            .onChange((value) => painting.spotLight.spotLight.distance = value);
        this.paintingLightFolder.add(data, 'angle', 0, 180).name("angle")
            .onChange((value) => painting.spotLight.spotLight.angle = value * Math.PI / 180 );
        this.paintingLightFolder.add(painting.spotLight.spotLight, 'penumbra', 0, 1).name("penumbra")
            .onChange((value) => painting.spotLight.spotLight.penumbra = value);
        this.paintingLightFolder.add(painting.spotLight.spotLight, 'decay', 0, 2).name("decay")
            .onChange((value) => painting.spotLight.spotLight.decay = value);
    }
}

export { MyGuiInterface };