// js/SceneController.js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class SceneController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.initControls();
        this.loadScene();
        this.addEventListeners();
        this.animate();

        // Intervals
        this.simulationIntervalID = null;
    }

    async loadScene() {
        try {
            const response = await fetch('scene.glb');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const arrayBuffer = await response.arrayBuffer();
            console.log('GLB scene loaded:', arrayBuffer);
            this.model.loadSceneFromGLB(arrayBuffer);

        } catch (error) {
            console.error('Error loading GLB scene:', error);
        }
    }

    initControls() {
        this.controls = new OrbitControls(this.model.camera, this.model.renderer.domElement);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.view.resize());

        this.view.setupOpenButton.addEventListener('click', () => {
            this.view.setupPanel.classList.remove('translate-x-full');
        });

        this.view.setupCloseButton.addEventListener('click', () => {
            this.view.setupPanel.classList.add('translate-x-full');
        });

        this.view.startSimulationButton.addEventListener('click', () => {
            this.view.startSimulationButton.classList.add('invisible');
            this.view.stopSimulationButton.classList.remove('invisible');
            this.view.setupPanel.classList.add('translate-x-full');

            this.startSimulation();
        });

        this.view.stopSimulationButton.addEventListener('click', () => {
            this.view.stopSimulationButton.classList.add('invisible');
            this.view.startSimulationButton.classList.remove('invisible');

            this.stopSimulation();
        });

        this.view.spPendulumPositionInput.addEventListener('change', () => {
            var pendulumPosition = Number.parseFloat(this.view.spPendulumPositionInput.value) * Math.PI / 180.0;
            // Update mobile elements
            this.model.updateSPInScene(pendulumPosition);
        });

        this.view.ipCartPositionInput.addEventListener('change', () => {
            var cartPosition = Number.parseFloat(this.view.ipCartPositionInput.value);
            // Update mobile elements
            this.model.updateIPCartInScene(cartPosition);
        });

        this.view.ipPendulumPositionInput.addEventListener('change', () => {
            var pendulumPosition = Number.parseFloat(this.view.ipPendulumPositionInput.value) * Math.PI / 180.0;
            // Update mobile elements
            this.model.updateIPPendulumInScene(pendulumPosition);
        });

        this.view.msdMassPositionInput.addEventListener('change', () => {
            var massPosition = Number.parseFloat(this.view.msdMassPositionInput.value);
            // Update mobile elements
            this.model.updateMSDInScene(massPosition);
        });

        this.view.helpOpenButton.addEventListener("click", () => {
            this.view.helpPanel.classList.remove("-translate-x-full");
        });

        this.view.helpCloseButton.addEventListener("click", () => {
            this.view.helpPanel.classList.add("-translate-x-full");
        });

        this.view.helpHeaders.forEach((header, index) => {
            header.addEventListener("click", () => {
                let topic = this.view.helpTopics[index];
                let content = topic.querySelector(".help-topic-content");

                //Show back bytton
                this.view.helpBackButton.classList.remove("hidden");

                // Hide non-selected help topics
                this.view.helpTopics.forEach((t, i) => {
                    if (i !== index) t.classList.add("hidden");
                    t.querySelector(".help-topic-content").classList.add("hidden");
                });

                // Show selected help topic
                content.classList.remove("hidden");
            });
        });

        this.view.setupHeaders.forEach((header, index) => {
            header.addEventListener("click", () => {
                let topic = this.view.setupTopics[index];
                let content = topic.querySelector(".setup-topic-content");

                //Show back bytton
                this.view.setupBackButton.classList.remove("hidden");

                // Hide non-selected help topics
                this.view.setupTopics.forEach((t, i) => {
                    if (i !== index) t.classList.add("hidden");
                    t.querySelector(".setup-topic-content").classList.add("hidden");
                });

                // Show selected help topic
                content.classList.remove("hidden");
            });
        });

        // Return button
        this.view.helpBackButton.addEventListener("click", () => {
            // Hide return button
            this.view.helpBackButton.classList.add("hidden");

            // Restore help topic list
            this.view.helpTopics.forEach(t => {
                t.classList.remove("hidden");
                t.querySelector(".help-topic-content").classList.add("hidden");
            });
        });

        this.view.setupBackButton.addEventListener("click", () => {
            // Hide return button
            this.view.setupBackButton.classList.add("hidden");

            // Restore help topic list
            this.view.setupTopics.forEach(t => {
                t.classList.remove("hidden");
                t.querySelector(".setup-topic-content").classList.add("hidden");
            });
        });

        // AR button
        this.view.arButton.addEventListener("click", () => {
            document.location = "../ar/";
        }); 

    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.view.stats.begin();   // Measure at the frame begining


        this.controls.update();
        this.view.render();

        this.view.stats.end();     // Measure at the frame end
    }

    startSimulation() {
        this.startSystemSimulations();
    }

    stopSimulation() {
        this.stopSystemSimulations();
    }

    startSystemSimulations() {
        /* For the inverted pendulum */
        // Get initial conditions
        var cartPosition = Number.parseFloat(this.view.ipCartPositionInput.value);
        var cartSpeed = Number.parseFloat(this.view.ipCartSpeedInput.value);
        var pendulumPosition = Number.parseFloat(this.view.ipPendulumPositionInput.value) * Math.PI / 180.0;
        var pendulumSpeed = Number.parseFloat(this.view.ipPendulumSpeedInput.value) * Math.PI / 180.0;

        // Get controller gains
        var kp1 = Number.parseFloat(this.view.ipCartKpInput.value);
        var ki1 = Number.parseFloat(this.view.ipCartKiInput.value);
        var kd1 = Number.parseFloat(this.view.ipCartKdInput.value);
        var kp2 = Number.parseFloat(this.view.ipPendulumKpInput.value);
        var ki2 = Number.parseFloat(this.view.ipPendulumKiInput.value);
        var kd2 = Number.parseFloat(this.view.ipPendulumKdInput.value);

        // Get desired task
        var desiredCartPosition = Number.parseFloat(this.view.ipDesiredCartPositionInput.value);
        var desiredPendulumPosition = Number.parseFloat(this.view.ipDesiredPendulumPositionInput.value) * Math.PI / 180.0;

        // Init simulation
        this.model.invertedPendulum.setInitialConditions(cartPosition, pendulumPosition, cartSpeed, pendulumSpeed);
        this.model.invertedPendulum.setControllerGains(kp1, ki1, kd1, kp2, ki2, kd2);
        this.model.invertedPendulum.setPositionRegulationTask(desiredCartPosition, desiredPendulumPosition);

        /* For the simple pendulum */
        // Get initial conditions
        var pendulumPosition = Number.parseFloat(this.view.spPendulumPositionInput.value) * Math.PI / 180.0;
        var pendulumSpeed = Number.parseFloat(this.view.spPendulumSpeedInput.value) * Math.PI / 180.0;

        // Get controller gains
        var kp = Number.parseFloat(this.view.spPendulumKpInput.value);
        var ki = Number.parseFloat(this.view.spPendulumKiInput.value);
        var kd = Number.parseFloat(this.view.spPendulumKdInput.value);

        // Get desired task
        var desiredPendulumPosition = Number.parseFloat(this.view.spDesiredPendulumPositionInput.value) * Math.PI / 180.0;

        // Init simulation
        this.model.simplePendulum.setInitialConditions(pendulumPosition, pendulumSpeed);
        this.model.simplePendulum.setControllerGains(kp, ki, kd);
        this.model.simplePendulum.setPositionRegulationTask(desiredPendulumPosition);

        /* For the mass-spring-damper */
        // Get initial conditions
        var massPosition = Number.parseFloat(this.view.msdMassPositionInput.value);
        var massSpeed = Number.parseFloat(this.view.msdMassSpeedInput.value);

        // Get controller gains
        var kp = Number.parseFloat(this.view.msdMassKpInput.value);
        var ki = Number.parseFloat(this.view.msdMassKiInput.value);
        var kd = Number.parseFloat(this.view.msdMassKdInput.value);

        // Get desired task
        var desiredMassPosition = Number.parseFloat(this.view.msdDesiredMassPositionInput.value);

        // Init simulation
        this.model.massSpringDamper.setInitialConditions(massPosition, massSpeed);
        this.model.massSpringDamper.setControllerGains(kp, ki, kd);
        this.model.massSpringDamper.setPositionRegulationTask(desiredMassPosition);


        //this.ipIntervalID = window.setInterval(this.model.simulateIP.bind(this.model), 5);
        this.simulationIntervalID = this.accurateTimer(); // Update every 30 ms / 6 steps of 5 ms (suitable for 30 FPS)
    }

    stopSystemSimulations() {
        this.simulationIntervalID.cancel();

        /* For the inverted pendulum */
        // Reset input fields
        this.view.ipCartPositionInput.value = 0;
        this.view.ipCartSpeedInput.value = 0;
        this.view.ipPendulumPositionInput.value = 0;
        this.view.ipPendulumSpeedInput.value = 0;

        /* For the simple pendulum */
        // Reset input fields
        this.view.spPendulumPositionInput.value = 0;
        this.view.spPendulumSpeedInput.value = 0;

        /* For the mass-spring-damper */
        // Reset input fields
        this.view.msdMassPositionInput.value = 0.25;
        this.view.msdMassSpeedInput.value = 0;


        // Reset scene
        this.model.updateSPInScene(0);
        this.model.updateIPInScene(0, 0);
    }


    accurateTimer = (time = 30) => { //
        // nextAt is the value for the next time the timer should fire.
        // timeout holds the timeoutID so the timer can be stopped.
        let nextAt, timeout;
        // Initilzes nextAt as now + the time in milliseconds you pass
        // to accurateTimer.
        nextAt = new Date().getTime() + time;

        // This function schedules the next function call.
        const wrapper = () => {
            // The next function call is always calculated from when the
            // timer started.
            nextAt += time;
            // this is where the next setTimeout is adjusted to keep the
            //time accurate.
            timeout = setTimeout(wrapper, nextAt - new Date().getTime());
            // the function passed to accurateTimer is called.
            this.model.simulateSP();
            this.model.simulateIP();
            this.model.simulateMSD();
        };

        // this function stops the timer.
        const cancel = () => clearTimeout(timeout);

        // the first function call is scheduled.
        timeout = setTimeout(wrapper, nextAt - new Date().getTime());

        // the cancel function is returned so it can be called outside
        // accurateTimer.
        return { cancel };
    };

}



export default SceneController;
