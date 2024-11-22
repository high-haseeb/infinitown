import { MapControls } from "three/addons/controls/MapControls.js";

class Controls{
    constructor(camera, renderer ) {

        this.controls = new MapControls(camera, renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.enableRotate = false;
        this.controls.enableZoom = false;
    }
    update() {
        this.controls.update();
    }
}
export default Controls;
