import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import LoadingScreen from "./LoadingScreen";
import Lighting from "./Lighting";
import { lerp } from "three/src/math/MathUtils";
import VehicleSystem from './VehicleSystem';

import Controls from "./Controls";
import Helicopter from "./Helicopter";

class Game {

    constructor() {

        this.zoom = 1;
        this.zooming = true;
        this.zoomInFactor = 3.0;
        this.zoomOutFactor = 1.5;

        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.lights = new Lighting(this.scene, this.renderer);

        this.controls = new Controls(this.camera, this.renderer);

        // gltf draco loader
        this.loader = new GLTFLoader();
        this.loadingScreen = new LoadingScreen();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
        this.loader.setDRACOLoader(this.dracoLoader);
        this.clock = new THREE.Clock(true);

        this.test();
        //
        // this.loadingScreen.hide();
        this.helione = new Helicopter(this.scene, this.loader, 50, 50, -100, 'orange');
        // this.helitwo = new Helicopter(this.scene, this.loader, 80, 100, -50, 'yellow', false);
        // this.vehicleSystem = new VehicleSystem(this.scene, this.loader);

        this.renderer.setAnimationLoop(this.update.bind(this));

        window.addEventListener("resize", this.onWindowResize.bind(this));
        window.addEventListener("wheel", this.zoomHandler.bind(this));
        document.addEventListener("touchstart", this.handlePinchStart.bind(this), { passive: false });
        document.addEventListener("touchmove", this.handlePinchChange.bind(this), { passive: false });
        document.addEventListener("touchend", this.handlePinchEnd.bind(this), { passive: false });
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color("#181818");
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(22, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(20, 30, 20);
        this.zoom = 1.5;
    }

    animateCamera() {
        if (Math.abs(this.camera.zoom - this.zoom) > 0.001) {
            this.camera.zoom = lerp(this.camera.zoom, this.zoom, 0.1);
            this.camera.updateProjectionMatrix();
        }
        this.camera.position.y = lerp(this.camera.position.y, this.zoom === this.zoomInFactor ? 20 : 30, 0.05);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
                glb.scene.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material.depthWrite = true;
                    }
                });
                glb.scene.scale.set(1/10, 1/10, 1/10);

                this.scene.add(glb.scene);
                loader.hide();
            },

            (xhr) => loader.update(xhr),
            (err) => console.error("[ERROR]", err)
        )
        let temp = 
            new THREE.Mesh(
                new THREE.BoxGeometry(),
                new THREE.MeshNormalMaterial,
            )
        temp.scale.setX(100);
        temp.scale.setZ(100);
        // this.scene.add(temp);
    }

    update() {
        const delta = this.clock.getDelta();
        // this.animateCamera();
        this.renderer.render(this.scene, this.camera);
        this.controls.update();
        this.lights.update(this.camera, this.controls.controls);
        // this.helione.update(delta);
        // this.vehicleSystem.update();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    zoomHandler(event) {
        const delta = event.deltaY;
        if (delta > 0) {
            this.zoom = this.zoomOutFactor;
        } else {
            this.zoom = this.zoomInFactor;
        }
    }

    handlePinchStart(event) {
        if (event.touches.length === 2) {
            const distance = this.getDistance(event.touches[0], event.touches[1]);
            this.initialDistance = distance;
        }
    }
    handlePinchChange(event) {
        if (event.touches.length === 2 && this.initialDistance !== null) {
            const distance = this.getDistance(event.touches[0], event.touches[1]);
            if (distance > this.initialDistance) {
                this.zoom = this.zoomInFactor;
            } else if (distance < this.initialDistance) {
                this.zoom = this.zoomOutFactor;
            }
        }
    }
    handlePinchEnd(event) {
        if (event.touches.length < 2) {
            this.initialDistance = null;
        }
    }
}
export default Game;
