# Dynamic Systems Virtual Laboratory (Web / WebVR / AR)

This repository contains an interactive virtual laboratory for the simulation and control of **dynamic systems** (simple pendulum, inverted pendulum, and mass-spring-damper system), developed using **Three.js**, **JavaScript ES Modules**, and a **Model-View-Controller (MVC)** architecture.

The laboratory allows:
- Real-time 3D visualization
- Configuration of initial conditions
- PID controller tuning
- Discrete-time numerical simulation
- Easy extensibility for new dynamic systems

---

## Project Dependencies

This project intentionally avoids bundlers or build tools. All dependencies are loaded directly from CDNs.

### Tailwind CSS (UI Styling)

Used for layout, panels, forms, and responsive UI elements:

```html
<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
```

### Three.js (ES Modules)

Three.js is imported using a native browser `importmap`:

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@v0.166.1/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@v0.166.1/examples/jsm/"
  }
}
</script>
```

This enables the use of:
- Core Three.js objects (`Scene`, `Camera`, `WebGLRenderer`)
- `GLTFLoader`
- `OrbitControls`
- `Stats.js`

No npm installation is required.

---

## Project Architecture (MVC)

The codebase follows a clear Model-View-Controller separation:

```
js/
├── models/
│   ├── SceneModel.js
│   ├── SimplePendulum.js
│   ├── InvertedPendulum.js
│   └── MassSpringDamper.js
│
├── views/
│   └── SceneView.js
│
├── controllers/
│   └── SceneController.js
│
└── main.js
```

- **Model**: system dynamics, numerical integration, and synchronization with the 3D scene  
- **View**: user interface and rendering  
- **Controller**: user interaction and simulation flow  

---

## Adding a New Dynamic System

It is assumed that:
- The 3D model already exists inside `scene.glb`
- Moving parts are properly named using `Object.name` in the GLB file

### 1. Dynamic Model (Models)

Create a new file in `js/models/`, for example:

```
js/models/NewDynamicSystem.js
```

The class should include:
- Physical parameters
- System states
- A `simulateStep()` method
- Methods for:
  - setting initial conditions
  - setting controller gains
  - defining a regulation task

Use existing models as references:
- `SimplePendulum.js`
- `InvertedPendulum.js`
- `MassSpringDamper.js`

---

### 2. SceneModel (Dynamics - 3D Binding)

Modify `SceneModel.js`:

**Import the new system**
```js
import NewDynamicSystem from './NewDynamicSystem.js';
```

**Instantiate it**
```js
this.newSystem = new NewDynamicSystem();
```

**Retrieve GLB objects (Mobile Parts)**
Inside `loadSceneFromGLB()`:
```js
this.newPart = this.scene.getObjectByName('NEW_SYSTEM_PART');
this.initNewPartState = this.newPart.position.clone();
```

**Create a scene update method**
```js
updateNewSystemInScene(x) {
  this.newPart.position.y = this.initNewPartState.y + x;
}
```

**Create a simulation method**
```js
simulateNewSystem() {
  for (let i = 0; i < 6; i++) {
    this.newSystem.simulateStep();
  }
  this.updateNewSystemInScene(this.newSystem.x);
}
```

---

### 3. User Interface (index.html)

Add a new block inside the **Simulation setup** panel:

- Initial conditions
- Desired values
- PID gains

Example:
```html
<div class="setup-topic">
  <button class="setup-topic-header">New system simulation</button>
  <div class="setup-topic-content hidden">
    <!-- System inputs -->
  </div>
</div>
```

Make sure to:
- Use unique `id` attributes
- Follow the same structure as existing systems

---

### 4. SceneView (UI References)

In `SceneView.js`, add references to the new inputs:

```js
this.newSystemPositionInput = document.getElementById('new-system-position');
```

This allows the controller to interact with the UI without directly manipulating the DOM.

---

### 5. SceneController (Simulation Logic)

Modify `SceneController.js`:

**Read input values**
```js
var x0 = Number.parseFloat(this.view.newSystemPositionInput.value);
```

**Initialize the system**
```js
this.model.newSystem.setInitialConditions(x0);
this.model.newSystem.setControllerGains(kp, ki, kd);
this.model.newSystem.setPositionRegulationTask(xd);
```

**Include it in the simulation loop**
```js
this.model.simulateNewSystem();
```

---

## Augmented Reality (AR) Extension

The project includes an AR version accessible via the **AR** button.

### Important Notes
- WebXR AR **requires HTTPS (SSL)**
- It does not work on plain `http://`
- A compatible browser is required (Chrome on Android)

### General Workflow
- The overall code structure is the same as the Web version
- Dynamic models, `SceneModel`, and simulation logic are reused
- Additional AR-specific elements include:
  - Reticle
  - Hit-test
  - Placement on real-world surfaces

The same extension steps described for the Web version apply to AR, with differences only in scene and camera initialization.

---

## Final Notes

- The system is designed for **educational extensibility**
- No build tools are required
- Suitable for teaching, demonstrations, and virtual laboratories
