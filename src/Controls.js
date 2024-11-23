import { MapControls } from "three/addons/controls/MapControls.js";

class Controls{
    constructor(camera, renderer ) {

        this.controls = new MapControls(camera, renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        // this.disableZoom();
        // this.disableRotate();
    }

    enableZoom() {
        this.controls.enableZoom = true;
    }
    enableRotate(){
        this.controls.enableRotate = true;
    }
    disableZoom(){
        this.controls.enableZoom = false;
    }
    disableRotate() {
        this.controls.enableRotate = false;
    }
    update() {
        this.controls.update();
    }
}
export default Controls;
