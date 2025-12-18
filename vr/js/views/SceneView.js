// js/views/SceneView.js
import Stats from 'three/addons/libs/stats.module.js';

class SceneView {
    constructor(containerId, model) {
        this.model = model;
        this.model.view = this;
        //Three.js elements
        this.container = document.getElementById(containerId);
        this.container.appendChild(this.model.renderer.domElement);

        //UI inputs
        //Simple Pendulum (SP)
        this.spPendulumPositionInput = document.getElementById('sp-pendulum-position');
        this.spPendulumSpeedInput = document.getElementById('sp-pendulum-speed');

        this.spDesiredPendulumPositionInput = document.getElementById('sp-desired-pendulum-position');

        this.spPendulumKpInput = document.getElementById('sp-pendulum-kp');
        this.spPendulumKiInput = document.getElementById('sp-pendulum-ki');
        this.spPendulumKdInput = document.getElementById('sp-pendulum-kd');

        //Inverted Pendulum (SP)
        this.ipCartPositionInput = document.getElementById('ip-cart-position');
        this.ipCartSpeedInput = document.getElementById('ip-cart-speed');
        this.ipPendulumPositionInput = document.getElementById('ip-pendulum-position');
        this.ipPendulumSpeedInput = document.getElementById('ip-pendulum-speed');

        this.ipDesiredCartPositionInput = document.getElementById('ip-desired-cart-position');
        this.ipDesiredPendulumPositionInput = document.getElementById('ip-desired-pendulum-position');

        this.ipCartKpInput = document.getElementById('ip-cart-kp');
        this.ipCartKiInput = document.getElementById('ip-cart-ki');
        this.ipCartKdInput = document.getElementById('ip-cart-kd');
        this.ipPendulumKpInput = document.getElementById('ip-pendulum-kp');
        this.ipPendulumKiInput = document.getElementById('ip-pendulum-ki');
        this.ipPendulumKdInput = document.getElementById('ip-pendulum-kd');

        //Mass Spring Damper (MSD)
        this.msdMassPositionInput = document.getElementById('msd-mass-position');
        this.msdMassSpeedInput = document.getElementById('msd-mass-speed');

        this.msdDesiredMassPositionInput = document.getElementById('msd-desired-mass-position');

        this.msdMassKpInput = document.getElementById('msd-mass-kp');
        this.msdMassKiInput = document.getElementById('msd-mass-ki');
        this.msdMassKdInput = document.getElementById('msd-mass-kd');

        // Help panel
        this.helpOpenButton = document.getElementById("help-open-button");
        this.helpPanel = document.getElementById("help-panel");
        this.helpCloseButton = document.getElementById("help-close-button");

        this.helpTopics = document.querySelectorAll(".help-topic");
        this.helpHeaders = document.querySelectorAll(".help-topic-header");
        this.helpBackButton = document.getElementById("help-back-button");

        // Form panel
        this.setupOpenButton = document.getElementById('setup-open-button');
        this.setupPanel = document.getElementById('setup-panel');
        this.setupCloseButton = document.getElementById('setup-close-button');

        this.setupTopics = document.querySelectorAll(".setup-topic");
        this.setupHeaders = document.querySelectorAll(".setup-topic-header");
        this.setupBackButton = document.getElementById("setup-back-button");


        this.startSimulationButton = document.getElementById('start-simulation');
        this.stopSimulationButton = document.getElementById('stop-simulation');

        //Stats panel
        this.stats = new Stats();
        this.stats.dom.style.position = "absolute";
        this.stats.dom.style.zIndex = "30";
        this.container.appendChild(this.stats.dom);

        //AR
        this.arButton = document.getElementById("ar-button");
    }

    render() {
        this.model.renderer.render(this.model.scene, this.model.camera);
    }

    resize() {
        this.model.camera.aspect = window.innerWidth / window.innerHeight;
        this.model.camera.updateProjectionMatrix();
        this.model.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export default SceneView;
