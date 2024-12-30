
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MyContents } from './MyContents.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import Stats from 'three/addons/libs/stats.module.js'

/**
 * This class contains the application object
 */
class MyApp  {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null
        this.stats = null

        // camera related attributes
        this.activeCamera = null
        this.activeCameraName = null
        this.lastCameraName = null
        this.cameras = []
        this.lookAt = []
        this.frustumSize = 20

        // other attributes
        this.renderer = null
        this.renderTarget = false;
        this.targetRGB = undefined;
        this.targetDepth = undefined;
        this.controls = null
        this.gui = null
        this.axis = null
        this.contents == null

        this.lastTime = performance.now();
        this.accumulator = 0;
    }
    /**
     * initializes the application
     */
    init() {
                
        // Create an empty scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x101010 );

        this.stats = new Stats()
        this.stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor("#000000");

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Configure renderer size
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        // Append Renderer to DOM
        document.getElementById("canvas").appendChild( this.renderer.domElement );

        // manage window resizes
        window.addEventListener('resize', this.onResize.bind(this), false );
    }

    /**
     * sets the active camera by name
     * @param {String} cameraName 
     */
    setActiveCamera(cameraName) {   
        this.activeCameraName = cameraName
        this.activeCamera = this.cameras[this.activeCameraName].clone();
    }

    /**
     * updates the active camera if required
     * this function is called in the render loop
     * when the active camera name changes
     * it updates the active camera and the controls
     */
    updateCameraIfRequired() {

        // camera changed?
        if (this.lastCameraName !== this.activeCameraName) {
            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName].clone();
            document.getElementById("camera").innerHTML = this.activeCameraName
           
            // call on resize to update the camera aspect ratio
            // among other things
            this.onResize()

            // are the controls yet?
            if (this.controls === null) {
                // Orbit controls allow the camera to orbit around a target.
                this.controls = new OrbitControls( this.activeCamera, this.renderer.domElement );
                this.controls.target.set(this.lookAt[this.activeCameraName].x, this.lookAt[this.activeCameraName].y, this.lookAt[this.activeCameraName].z)
                this.controls.enableZoom = true;
                this.controls.update();
            }
            else {
                this.controls.object = this.activeCamera
                this.controls.target.set(this.lookAt[this.activeCameraName].x, this.lookAt[this.activeCameraName].y, this.lookAt[this.activeCameraName].z)
            }
        }
    }

    updateTarget() {
        this.controls.target.set(this.lookAt[this.activeCameraName].x, this.lookAt[this.activeCameraName].y, this.lookAt[this.activeCameraName].z)
    }

    setupMovingCamera(distance) {
        if (!this.controls) return;

        this.controls.maxDistance = distance;
        this.controls.minDistance = distance;
        if (distance > 1) {
            this.controls.maxPolarAngle = Math.PI / 6 * 2;
            this.controls.minPolarAngle = Math.PI / 6;
        } else {
            this.controls.maxPolarAngle = Math.PI/2 + 0.25;
            this.controls.minPolarAngle = Math.PI/2 - 0.25;
        }

        this.controls.object = this.activeCamera;
        this.updateTarget();
    }

    setupFixedCamera() {
        if (!this.controls) return;
        
        this.controls.maxPolarAngle = Math.PI;
        this.controls.minPolarAngle = 0;
        this.controls.minDistance = 0;
        this.controls.maxDistance = Infinity;

        this.controls.object = this.activeCamera;
        this.updateTarget();
    }

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }
    }
    /**
     * 
     * @param {MyContents} contents the contents object 
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * @param {MyGuiInterface} contents the gui interface object
     */
    setGui(gui) {   
        this.gui = gui
    }

    /**
    * the main render function. Called in a requestAnimationFrame loop
    */
    render () {
        this.stats.begin()
        this.updateCameraIfRequired()

        const now = performance.now();
        const deltaTime = now - this.lastTime;
        this.lastTime = now;

        // 60 fps
        const fixedTimeStep = 1 / 60;
        this.accumulator += deltaTime / 1000;

        while (this.accumulator >= fixedTimeStep) {
            this.contents.update();
            this.accumulator -= fixedTimeStep;
        }

        // update the animation if contents were provided
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            // required if controls.enableDamping or controls.autoRotate are set to true
            this.controls.update();

            if (this.renderTarget) {
                this.renderTarget = false;

                const target = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight );
                target.depthTexture = new THREE.DepthTexture();
                target.depthTexture.magFilter = THREE.NearestFilter;
                target.depthTexture.minFilter = THREE.NearestFilter;
                target.depthTexture.format = THREE.DepthFormat;
                target.depthTexture.type = THREE.UnsignedIntType;

                this.renderer.setRenderTarget(target);
                this.renderer.render(this.scene, this.activeCamera);
                this.renderer.setRenderTarget(null);
                
                this.targetRGB = target.texture;
                this.targetDepth = target.depthTexture;
            }
            
            // render the scene
            this.renderer.render(this.scene, this.activeCamera);
        }



        // subsequent async calls to the render loop
        requestAnimationFrame( this.render.bind(this) );

        this.lastCameraName = this.activeCameraName
        this.stats.end()
    }
}


export { MyApp };