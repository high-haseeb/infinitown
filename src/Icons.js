import { DEG2RAD } from "three/src/math/MathUtils";
import { Raycaster, Vector2 } from "three";

class Icons {
    constructor(scene, loader, camera, renderer) {
        this.scene = scene;
        this.loader = loader;
        this.camera = camera;
        this.renderer = renderer;
        this.iconsModel = null;

        this.raycaster = new Raycaster();
        this.mouse = new Vector2();
        this.intersectedModel = null;

        this.loadModel();

        // Event listener for mouse move
        this.renderer.domElement.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.renderer.domElement.addEventListener("click", this.onMouseClick.bind(this));
    }

    loadModel() {
        this.loader.load('/models/icons.glb', (glb) => {
            this.iconsModel = glb.scene;
            this.iconsModel.traverse(model => {
                if (model.isMesh) {
                    model.rotation.x = -45 * DEG2RAD;
                    model.originalScale = model.scale.clone(); // Save original scale
                }
            });
            this.iconsModel.scale.set(1 / 10, 1 / 10, 1 / 10);
            this.scene.add(this.iconsModel);
        });
    }

    onMouseMove(event) {
        // Convert mouse position to normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Perform raycasting
        if (!this.iconsModel) return;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.iconsModel.children, true);

        if (intersects.length > 0) {
            this.intersectedModel = intersects[0].object; // Get the first intersected model
        } else {
            this.intersectedModel = null;
        }
    }

    onMouseClick() {
        if (this.intersectedModel) {
            this.intersectedModel.isClicked = !this.intersectedModel.isClicked; // Toggle click state
            window.open('https://youtube.com/', '_blank')
        }
    }

    update() {
        if (!this.iconsModel) return;

        this.iconsModel.traverse(model => {
            if (model.isMesh) {
                model.up.set(0, 1, 0);
                model.lookAt(this.camera.position.x, 0, this.camera.position.z);

                const targetScale = model.isClicked ? model.originalScale.clone().multiplyScalar(1.5) : (model === this.intersectedModel ? model.originalScale.clone().multiplyScalar(4.0) : model.originalScale);
                
                // Smoothly lerp to the target scale
                model.scale.lerp(targetScale, 0.1);
            }
        });
    }
}

export default Icons;
