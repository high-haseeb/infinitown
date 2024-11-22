import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import LoadingScreen from "./LoadingScreen";
import Lighting from "./Lighting";
import { lerp } from "three/src/math/MathUtils";

import Controls from "./Controls";
import Helicopter from "./Helicopter";

class Game {

    constructor() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        new Lighting(this.scene, this.renderer);

        this.controls = new Controls(this.camera, this.renderer);

        // gltf draco loader
        this.loader = new GLTFLoader();
        this.loadingScreen = new LoadingScreen();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
        this.loader.setDRACOLoader(this.dracoLoader);
        this.clock = new THREE.Clock(true);

        this.test();
        this.helione = new Helicopter(this.scene, this.loader, 50, 50, -100, 'orange');
        this.helitwo = new Helicopter(this.scene, this.loader, 80, 100, -50, 'yellow', false);
        this.loadingScreen.hide();



        this.renderer.setAnimationLoop(this.update.bind(this));
        window.addEventListener("resize", this.onWindowResize.bind(this));
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color("#181818");
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(22, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(200, 300, 200);
        this.zoom = 1.5;
    }

    animateCamera() {
        if (Math.abs(this.camera.zoom - this.zoom) > 0.001) {
            this.camera.zoom = lerp(this.camera.zoom, this.zoom, 0.1);
            this.camera.updateProjectionMatrix();
        }
        // this.camera.position.y = 100;//lerp(this.camera.position.y, this.zoom === 1 ? this.cameraInitial : 7, 0.1);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // this.renderer.setClearColor(this.fogColor);
        document.body.appendChild(this.renderer.domElement);
    }

    test() {
        let loader = new LoadingScreen();
        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
        this.loader.setDRACOLoader(this.dracoLoader);

        this.loader.load(
            "/models/city.glb",

            (glb) => {
                this.scene.add(glb.scene);
                loader.hide();
            },

            (xhr) => loader.update(xhr),
            (err) => console.error("[ERROR]", err)
        )
    }

    update() {
        const delta = this.clock.getDelta();
        this.animateCamera();
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
        this.helione.update(delta);
        this.helitwo.update(delta);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
export default Game;
