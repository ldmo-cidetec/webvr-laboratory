// js/models/SceneModel.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import SimplePendulum from './SimplePendulum.js';
import InvertedPendulum from './InvertedPendulum.js';
import MassSpringDamper from './MassSpringDamper.js';

class SceneModel {
    constructor() {
        THREE.Cache.enabled = true;

        this.view = null;
        this.steps = 0;
        this.shadowReceivers = Object.freeze(['Wall', 'Floor', 'Desk_Surface']);

        // Robots / systems
        this.simplePendulum = new SimplePendulum();
        this.invertedPendulum = new InvertedPendulum();
        this.massSpringDamper = new MassSpringDamper();

        // Scene
        this.scene = new THREE.Scene();
        this.laboratoryScene = null;

        // Camera
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.xr.enabled = true;
        // The renderer is sent to the front of the device

        // AR Session
        this.xrSession = null;
        this.hitTestSource = null;

        // Anchors
        this.anchor = null;
        this.anchorSpace = null;
        this.latestHit = null;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);

        // Mobile parts
        this.spPendulum = null;

        this.ipCart = null;
        this.ipPendulum = null;

        this.msdSpring = null;
        this.msdMass = null;

        this.initSPPendulumRotation = null;
        this.initIPCartPosition = null;
        this.initIPPendulumPosition = null;
        this.initIPPendulumRotation = null;
        this.initMSDMassPosition = null;
        this.initMSDSpringScale = null;

        this.objects = [];

        // Reticle
        this.reticle = null;

    }

    addObject(object) {
        this.scene.add(object);
        this.objects.push(object);
    }

    removeObject(object) {
        this.scene.remove(object);
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }

    async loadSceneFromGLB(glb) {
        const loader = new GLTFLoader();
        loader.parse(glb, '', (gltf) => {
            // Define shadow casters and receivers
            gltf.scene.traverse((child) => {
                if (child.isLight) {
                    child.castShadow = true;
                }

                if (child.isMesh) {
                    if (this.shadowReceivers.includes(child.name)) {
                        child.receiveShadow = true;
                    } else {
                        child.castShadow = true;
                    }

                    if (child.name == 'Desk_Surface') {
                        child.castShadow = true;
                    }
                }
            });

            // Add GLB scene to the current scene
            this.scene.add(gltf.scene);
            this.laboratoryScene = gltf.scene;
            this.laboratoryScene.visible = false;

            // Get mobile elements of the scene and original state
            this.spPendulum = this.scene.getObjectByName('SP_Pendulum');
            this.initSPPendulumRotation = this.spPendulum.rotation.clone();

            this.ipCart = this.scene.getObjectByName('IP_Cart');
            this.initIPCartPosition = this.ipCart.position.clone();

            this.ipPendulum = this.scene.getObjectByName('IP_Pendulum');
            this.initIPPendulumRotation = this.ipPendulum.rotation.clone();
            this.initIPPendulumPosition = this.ipPendulum.position.clone();

            this.msdMass = this.scene.getObjectByName('MSD_Mass');
            this.initMSDMassPosition = this.msdMass.position.clone();

            this.msdSpring = this.scene.getObjectByName('MSD_Spring');
            this.initMSDSpringScale = this.msdSpring.scale.clone();

            console.log('GLB scene loaded successfully');
        }, (error) => {
            console.error('Error loading GLB:', error);
        });
    }

    async loadReticle() {
        const loader = new GLTFLoader();
        loader.load(
            "https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf",
            (gltf) => {  // <- Arrow function mantiene el contexto de 'this'
                this.reticle = gltf.scene;
                this.reticle.visible = true;
                this.scene.add(this.reticle);
            }
        );
    }

    // Update Inverted Pendulum
    updateIPInScene(x, th) {
        this.updateIPCartInScene(x);
        this.updateIPPendulumInScene(th);
    }

    updateIPCartInScene(x) {
        this.ipCart.position.x = this.initIPCartPosition.x - x;  // Moves the cart
        this.ipPendulum.position.x = this.initIPPendulumPosition.x - x; // Moves also the pendulum
    }

    updateIPPendulumInScene(th) {
        this.ipPendulum.rotation.y = this.initIPPendulumRotation.y - th; // Rotates the pendulum
    }

    // Update Simple Pendulum
    updateSPInScene(th) {
        this.spPendulum.rotation.z = this.initSPPendulumRotation.z + th; // Rotates the pendulum
    }

    // Update Mass Spring Damper
    updateMSDInScene(x) { // Mass goes from -0.03 m to +0.47 m (initial position in 3D 0.25 m)
        this.msdMass.position.y = this.initMSDMassPosition.y + x - 0.25;  // Moves the mass
        var scale = x / 0.25;
        this.msdSpring.scale.x = scale; // Scales the spring
    }

    // Simulate Simple Pendulum
    simulateSP() {
        for (var i = 0; i < 6; i++) {  // Simulate 30 ms (6*0.005s, suitable for 30 FPS)
            this.simplePendulum.simulateStep(); // Perform a simulation step
            //this.steps++;
            //console.log("POS "+this.steps+": "+this.simplePendulum.th);
        }

        this.updateSPInScene(this.simplePendulum.th); // Update scene with the simulation information

        // Update view with the simulation information
        this.view.spPendulumPositionInput.value = (this.simplePendulum.th * 180 / Math.PI).toFixed(4);
        this.view.spPendulumSpeedInput.value = (this.simplePendulum.thdot * 180 / Math.PI).toFixed(4);
    }

    // Simulate Mass Spring Damper
    simulateMSD() {
        for (var i = 0; i < 6; i++) {  // Simulate 30 ms (6*0.005s, suitable for 30 FPS)
            this.massSpringDamper.simulateStep(); // Perform a simulation step
            //this.steps++;
            //console.log("POS "+this.steps+": "+this.simplePendulum.th);
        }

        this.updateMSDInScene(this.massSpringDamper.x); // Update scene with the simulation information

        // Update view with the simulation information
        this.view.msdMassPositionInput.value = (this.massSpringDamper.x).toFixed(4);
        this.view.msdMassSpeedInput.value = (this.massSpringDamper.xdot).toFixed(4);
    }

    // Simulate Inverted Pendulum
    simulateIP() {
        for (var i = 0; i < 6; i++) { // Simulate 30 ms (6*0.005s, suitable for 30 FPS)
            this.invertedPendulum.simulateStep(); // Perform a simulation step
        }
        this.updateIPInScene(this.invertedPendulum.x, this.invertedPendulum.th); // Update scene with the simulation information

        // Update view with the simulation information
        this.view.ipCartPositionInput.value = (this.invertedPendulum.x).toFixed(4);
        this.view.ipCartSpeedInput.value = (this.invertedPendulum.xdot).toFixed(4);
        this.view.ipPendulumPositionInput.value = (this.invertedPendulum.th * 180 / Math.PI).toFixed(4);
        this.view.ipPendulumSpeedInput.value = (this.invertedPendulum.thdot * 180 / Math.PI).toFixed(4);
    }
}

export default SceneModel;
