// js/main.js
import SceneModel from './models/SceneModel.js';
import SceneView from './views/SceneView.js';
import SceneController from './controllers/SceneController.js';

document.addEventListener('DOMContentLoaded', () => {
    const model = new SceneModel();
    const view = new SceneView('scene-container', model);
    const controller = new SceneController(model, view);

    // Intro
    const modal = document.getElementById("welcome-modal");
    const closeBtn = document.getElementById("welcome-modal-close");
    const dontShowChk = document.getElementById("welcome-dont-show-again");

    // Show only if the user has not hidden it before
    if (!localStorage.getItem("laboratory_welcome_hide")) {
        modal.classList.remove("hidden");
    }

    closeBtn.addEventListener("click", () => {

        if (dontShowChk.checked) {
            localStorage.setItem("laboratory_welcome_hide", "true");
        }

        modal.classList.add("hidden");
    });
});
