// js/main.js
import SceneModel from './models/SceneModel.js';
import SceneView from './views/SceneView.js';
import SceneController from './controllers/SceneController.js';

async function checkARSupport() {
    if (!('xr' in navigator)) {
        console.warn("WebXR not available in this browser.");
        return false;
    }

    let immersiveAR = false;
    try {
        immersiveAR = await navigator.xr.isSessionSupported('immersive-ar');
    } catch (e) {
        immersiveAR = false;
    }

    if (!immersiveAR) {
        console.warn("immersive-ar not supported.");
        return false;
    }

    return true;
}

document.addEventListener('DOMContentLoaded', async () => {
    // Intro
    const modal = document.getElementById("welcome-modal");
    const closeBtn = document.getElementById("welcome-modal-close");
    const dontShowChk = document.getElementById("welcome-dont-show-again");

    // Show only if the user has not hidden it before
    if (!localStorage.getItem("ar_laboratory_welcome_hide")) {
        modal.classList.remove("hidden");
    }

    closeBtn.addEventListener("click", () => {

        if (dontShowChk.checked) {
            localStorage.setItem("ar_laboratory_welcome_hide", "true");
        }

        modal.classList.add("hidden");
    });

    // VR button
    const vrButton = document.getElementById("vr-button");

    vrButton.addEventListener("click", () => {
        window.location.href = "../vr/";
    });

    // Check if device supports WebXR
    const startARCoreButton = document.getElementById("start-ar-core-button");

    // Loading button
    startARCoreButton.disabled = true;
    startARCoreButton.textContent = "CHECKING AR...";

    const supported = await checkARSupport();

    if (!supported) {
        startARCoreButton.textContent = "AR NOT SUPPORTED";
        return;
    }

    // All supported
    startARCoreButton.textContent = "LOADING...";
    const model = new SceneModel();
    const view = new SceneView('scene-container', model);
    const controller = new SceneController(model, view);
});


// Handle +/- buttons for AR interface (traditional web forms cannot be used in AR)
document.querySelectorAll("button[data-step]").forEach(btn => {
    btn.addEventListener("click", () => {
        const step = parseFloat(btn.dataset.step);
        const input = document.getElementById(btn.dataset.target);

        const min = input.dataset.min ? parseFloat(input.dataset.min) : -Infinity;
        const max = input.dataset.max ? parseFloat(input.dataset.max) : Infinity;

        let value = parseFloat(input.value) || 0;
        let newValue = value + step;

        // Bounds
        newValue = Math.max(min, Math.min(max, newValue));

        // Round according to data-step
        const precision = (input.dataset.step?.split(".")[1]?.length) || 0;
        input.value = newValue.toFixed(precision);

        // Trigger change event
        input.dispatchEvent(new Event("change", { bubbles: true }));
    });
});
