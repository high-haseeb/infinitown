import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { lerp } from "three/src/math/MathUtils";
// import Stats from "three/examples/jsm/libs/stats.module";
//
// TODO:
// make a traffic light system for the cars
// make use of random cars in the begining (not the same pattern everytime)

class Game {
    constructor() {
        this.camera = null;
        this.scene = null;
        this.model = null;
        this.renderer = null;
        this.isMoving = false;
        this.cameraTarget = new THREE.Vector3();
        this.controlsTarget = new THREE.Vector3();
        this.activeLabel = 0;
        this.cameraInitial = 20;
        this.initialDistance = null;
        this.controls = null;
        this.fogColor = 0xcccccc;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.labelDom = document.getElementById("label");

        this.loader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
        this.loader.setDRACOLoader(this.dracoLoader);

        this.slow = 0.01;
        this.medium = 0.02;
        this.fast = 0.04;
        this.BRAKING_DISTANCE = 1.7;
        this.directionMappings = {
            south: { axis: "z", moveAmount: 1, rotation: Math.PI / 2 },
            north: { axis: "z", moveAmount: -1, rotation: -Math.PI / 2 },
            west: { axis: "x", moveAmount: 1, rotation: Math.PI },
            east: { axis: "x", moveAmount: -1, rotation: 0 },
        };
        this.intersections = {
            north: [-5.6, 4.5, 1, -1.4],
            south: [6, 2.5, -2.9, -0.8],
        };
        this.carsData = [
            { file_path: "cars/ambulance", x: 0, z: 3.55, dir: "west", speed: this.medium, name: "1" },
            { file_path: "cars/tow_1", x: 4, z: 3.55, dir: "west", speed: this.medium, name: "2" },
            { file_path: "cars/tow_2", x: -4, z: 3.55, dir: "west", speed: this.medium, name: "3" },
            { file_path: "cars/ambulance", x: 5, z: 3.15, dir: "east", speed: this.fast, name: "4" },
            { file_path: "cars/car_1", x: 2, z: 3.15, dir: "east", speed: this.fast, name: "5" },
            { file_path: "cars/suv_1", x: -4, z: 3.15, dir: "east", speed: this.fast, name: "6" },
            { file_path: "cars/suv_2", x: -4, z: 3.9, dir: "west", speed: this.fast, name: "7" },
            { file_path: "cars/suv_3", x: 4, z: 3.9, dir: "west", speed: this.fast, name: "8" },
            { file_path: "cars/car_4", x: 2, z: 3.9, dir: "west", speed: this.fast, name: "9" },
            { file_path: "cars/car_2", x: -2, z: 3.9, dir: "west", speed: this.fast, name: "10" },
            { file_path: "cars/pickup_1", x: 0, z: 0.2, dir: "west", speed: this.fast, name: "11" },
            { file_path: "cars/container_3", x: 3, z: 0.2, dir: "west", speed: this.fast, name: "12" },
            { file_path: "cars/container_2", x: 3, z: -0.2, dir: "east", speed: this.slow, name: "13" },
            { file_path: "cars/truck_2", x: -3, z: -0.2, dir: "east", speed: this.slow, name: "14" },
            { file_path: "cars/container_1", x: 0, z: -2.36, dir: "east", speed: this.fast, name: "25" },
            { file_path: "cars/bus_3", x: 3, z: -2.36, dir: "east", speed: this.fast, name: "26" },
            { file_path: "cars/suv_2", x: -3, z: -2.36, dir: "east", speed: this.fast, name: "27" },
            { file_path: "cars/suv_2", x: -2, z: -2.0, dir: "west", speed: this.fast, name: "28" },
            { file_path: "cars/pickup_2", x: 1, z: -2.0, dir: "west", speed: this.fast, name: "29" },
            { file_path: "cars/car_4", x: 4, z: -2.0, dir: "west", speed: this.fast, name: "30" },
            { file_path: "cars/car_4", x: 4, z: 6.8, dir: "east", speed: this.fast, name: "31" },
            { file_path: "cars/truck_2", x: 0, z: 6.8, dir: "east", speed: this.fast, name: "32" },
            { file_path: "cars/bus_3", x: 4, z: 7.2, dir: "west", speed: this.medium, name: "33" },
            { file_path: "cars/bus_2", x: -4.0, z: 7.2, dir: "west", speed: this.medium, name: "34" },
            { file_path: "cars/car_2", x: -0.2, z: this.intersections.north[0], dir: "south", speed: this.fast, name: "35" },
            { file_path: "cars/suv_1", x: 0.2, z: this.intersections.south[2], dir: "north", speed: this.fast, name: "36" },
            { file_path: "cars/bus_2", x: -6.3, z: this.intersections.north[0], dir: "north", speed: this.fast, name: "37" },
            // { file_path: "cars/pickup_1", x: -6.7, z: this.intersections.south[3], dir: "south", speed: this.fast, name: "38" },
        ];
        // this.labelData = [
        //     { path: "circlebuilding.svg", position: new THREE.Vector3(-4.9, 2.7,  1.9),  name: "Genel Müdürlük", link: "http://localhost:3000" },
        //     { path: "coffeeshop.svg",     position: new THREE.Vector3(2.6,  0.9,  2.4),  name: "Kahve Molası",   link: "http://localhost:3000" },
        //     { path: "anaacentem.svg",     position: new THREE.Vector3(-1.5, 1.7,  2.25), name: "Ana Acentem",    link: "http://localhost:3000" },
        //     { path: "hospital.svg",       position: new THREE.Vector3(1,    1.2,  2.3),  name: "Ana Sağlık",     link: "http://localhost:3000/#anlasmali-kurumlar" },
        //     { path: "factory.svg",   position: new THREE.Vector3(5,    0.8,  1.7),  name: "Ana Servis", link: "http://localhost:3000/#anlasmali-kurumlar" },
        //     { path: "phone.svg",     position: new THREE.Vector3(-3.8, 0.35, 2.5),  name: "İletişim",   link: "http://localhost:3000/#iletisim" },
        //     { path: "muhtarlik.svg", position: new THREE.Vector3(-1,   0.8,  -3.5), name: "Muhtarlık",  link: "http://localhost:3000" },
        //     { name: "Anasayfa" },
        // ];
        this.carsGroup = [];
        this.planeGroup = new THREE.Group();
        this.size = new THREE.Vector3();
        this.num_z_planes = 2;
        this.num_x_planes = 2;
        this.zoom = 1;
        this.zooming = true;
        this.zoomInFactor = 1.5;
        this.zoomOutFactor = 1;
        this.textureLoader = new THREE.TextureLoader();
        this.init();
    }
    showLoadingScreen() {
        document.getElementById("loading-screen").style.display = "flex";
    }
    hideLoadingScreen() {
        document.getElementById("loading-screen").style.display = "none";
    }
    loadCars() {
        this.carsData.forEach((car) => {
            this.loader.load(car.file_path + ".glb", (gltf) => {
                gltf.scene.name = car.name;
                gltf.scene.position.set(car.x, 0, car.z);
                gltf.scene.rotation.y = this.directionMappings[car.dir].rotation;
                gltf.scene.scale.set(0.09, 0.09, 0.09);
                this.carsGroup.push({ object: gltf.scene, ...car });
            });
        });
    }
    updateCars() {
        for (const car of this.carsGroup) {
            const temp = this.scene.getObjectsByProperty("name", car.name);
            const directionParams = this.directionMappings[car.dir];
            temp.forEach((tempcar) => {
                if (car.dir === "north" || car.dir === "east") {
                    if (Math.abs(tempcar.position[directionParams.axis]) > this.size[directionParams.axis === "x" ? "z" : "x"] / 2) {
                        tempcar.position[directionParams.axis] = this.size[directionParams.axis === "x" ? "z" : "x"] / 2;
                    }
                }
                if (car.dir === "south" || car.dir === "west") {
                    if (tempcar.position[directionParams.axis] > this.size[directionParams.axis === "x" ? "z" : "x"] / 2) {
                        tempcar.position[directionParams.axis] = -this.size[directionParams.axis === "x" ? "z" : "x"] / 2;
                    }
                }

                if (car.dir === "north" || car.dir === "south") {
                    let shouldStop = false;
                    this.intersections[car.dir].forEach((pos) => {
                        if (Math.abs(tempcar.position.z - pos) < 0.1) {
                            for (const othercar of this.carsGroup) {
                                if (othercar.dir === "west" || othercar.dir === "east") {
                                    const otherCar = this.scene.getObjectByProperty("name", othercar.name);
                                    if (Math.abs(otherCar.position.x - tempcar.position.x) < 0.7) {
                                        shouldStop = true;
                                    }
                                }
                            }
                        }
                    });
                    !shouldStop && (tempcar.position[directionParams.axis] += directionParams.moveAmount * car.speed);
                } else {
                    tempcar.position[directionParams.axis] += directionParams.moveAmount * car.speed;
                }
            });
        }
    }
    createVideoMesh = (position) => {
        const video = document.getElementById("arrow-down");
        video.play();
        const videoTexture = new THREE.VideoTexture(video);
        const videoMaterial = new THREE.SpriteMaterial({ map: videoTexture });
        const mesh = new THREE.Sprite(videoMaterial);
        const xOffset = 0.195;
        const zOffset = 0.21;
        const scale = 0.12;
        mesh.position.set(position.x + xOffset, position.y + 0.012, position.z + zOffset);
        mesh.scale.set(scale, scale, scale);
        this.model.add(mesh);
    };
    createSprite = () => {
        // this.labelData.forEach((label) => {
        //     if (label.path) {
        //         const map = this.textureLoader.load(`/img/${label.path}`);
        //         const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map }));
        //         sprite.name = label.name;
        //         sprite.position.copy(label.position);
        //         sprite.scale.set(0.8, 0.23, 1);
        //         this.createVideoMesh(label.position);
        //         this.model.add(sprite);
        //     }
        // });
    };
    addSpritesOnClick() {
        // this.labelData.forEach((label) => {
        //     const labelObjects = this.scene.getObjectsByProperty("name", label.name);
        //     labelObjects.forEach((labelclone) => {
        //         this.onClick(labelclone, () => {
        //             this.moveToNextLabel(label.name);
        //             setTimeout(() => window.open(label.link, "_blank"), 1000);
        //         });
        //     });
        // });
    }
    distanceToSquared(a, b) {
        return (b.x - a.x) ** 2 + (b.z - a.z) ** 2;
    }

    setupLights() {
        this.light = new THREE.DirectionalLight(0xffffff, 5);
        this.light.castShadow = true;
        this.light.position.set(50, -10, 100);
        this.light.rotation.set(0.3, -0.6, -0.4);
        this.light.shadow.mapSize.width = 1024;
        this.light.shadow.mapSize.height = 1024;
        this.light.shadow.bias = -0.001;

        this.scene.add(this.light.target);
        this.scene.add(this.light);

        this.scene.add(new THREE.HemisphereLight(0xffffff, 0xffffff, 1));
    }
    updateLights() {
        this.light.position.copy(this.camera.position).add({ x: 0, y: -2, z: -9 });
        this.light.target.position.copy(this.controls.target);
    }
    loadVideoTexture() {
        // const video = document.getElementById("billBoardVideo");
        const tex = this.textureLoader.load('/img/billBoard.jpeg');
        const material2 = new THREE.MeshBasicMaterial({ map: tex })
        const vplane = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), material2);
        this.onClick(vplane, () => {
            window.open("http://localhost:3000", "_blank");
        });
        vplane.position.z = -0.95;
        vplane.position.y = 0.7;
        vplane.position.x = -1.62;
        vplane.name = "billBoardVideo";
        this.model.add(vplane);
    }
    loadCity() {
        this.loadCars();
        this.loader.load(
            "/gltf/city-snow.glb",
            (gltf) => {
                this.model = gltf.scene;
                this.model.rotation.y = Math.PI / 2;
                this.model.position.set(-1, 0, -0);

                this.carsGroup.forEach((car) => {
                    this.model.add(car.object.clone());
                });
                this.loadVideoTexture();
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        child.receiveShadow = true;
                        child.castShadow = true;
                    }
                });

                const box = new THREE.Box3().setFromObject(this.model);
                box.getSize(this.size);
                this.createSprite();

                for (let row = 0; row < this.num_x_planes; row++) {
                    for (let col = 0; col < this.num_z_planes; col++) {
                        const temp = this.model.clone();
                        temp.position.set(
                            this.model.position.x + row * this.size.x,
                            0,
                            this.model.position.z + col * (this.size.z - 0.07)
                        );
                        this.planeGroup.add(temp);
                    }
                }
                this.scene.add(this.planeGroup);
                this.hideLoadingScreen();
                this.addSpritesOnClick();
                this.cameraInitial = 11;
            },
            (xhr) => {
                const loader = document.getElementById("loader");
                if (!loader) {
                    console.error("no element with id loader found");
                    return;
                }
                loader.style.width = `${(xhr.loaded / xhr.total) * window.innerWidth}px`;
            },
        );
    }
    updatePlanes() {
        this.planeGroup.children.forEach((plane) => {
            if (this.camera.position.z < plane.position.z - (this.size.z / 3)) {
                plane.position.setZ(plane.position.z - (this.size.z * this.num_z_planes));
            }
            if (this.camera.position.z > plane.position.z + (this.size.z * this.num_z_planes) - this.size.z / 3) {
                plane.position.setZ(plane.position.z + (this.size.z * this.num_z_planes));
            }

            if (this.camera.position.x < plane.position.x - (this.size.x / 3)) {
                plane.position.setX(plane.position.x - this.size.x * this.num_x_planes);
            }
            if (this.camera.position.x > plane.position.x + (this.size.x * this.num_x_planes) - this.size.x / 3) {
                plane.position.setX(plane.position.x + (this.size.x * this.num_x_planes));
            }
        });
    }
    zoomHandler(event) {
        const delta = event.deltaY;
        if (delta > 0) {
            this.zoom = this.zoomOutFactor;
            this.hideLabelDom();
        } else {
            this.zoom = this.zoomInFactor;
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onClick(object, callback) {
        window.addEventListener("click", (event) => {
            event.preventDefault();
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(object);
            if (intersects.length > 0) {
                callback(intersects[0]);
            }
        });

        window.addEventListener("touchstart", (event) => {
            event.preventDefault();
            let clientX = event.touches[0].clientX;
            let clientY = event.touches[0].clientY;
            this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObject(object);
            if (intersects.length > 0) {
                callback(intersects[0]);
            }
        });
    }
    setupRenderer() {
        const rendererCanvas = document.getElementById("game");
        if (rendererCanvas === null) {
            console.error("no canvas found with id game");
            return;
        }
        this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas: rendererCanvas });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(this.fogColor);
    }
    setupControls() {
        this.controls = new MapControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enableRotate = false;
        this.controls.dampingFactor = 0.1;
        this.controls.enableZoom = false;
    }
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(22, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(7, 100, 7);
    }
    animateCamera() {
        if (Math.abs(this.camera.zoom - this.zoom) > 0.001) {
            this.camera.zoom = lerp(this.camera.zoom, this.zoom, 0.1);
            this.camera.updateProjectionMatrix();
        }
        this.camera.position.y = lerp(this.camera.position.y, this.zoom === 1 ? this.cameraInitial : 7, 0.1);
    }
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(this.fogColor, 6, 100);
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
    setupSnow() {
        this.N = 1000;
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;

        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(15, 15, 2, 15, 15, 15);
        gradient.addColorStop(0, 'white');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 32, 32);

        const snowflakeTexture = new THREE.CanvasTexture(canvas);

        // Create snowflake positions and speeds
        const positions = new Float32Array(this.N * 3);
        const speeds = new Float32Array(this.N);

        for (let i = 0; i < this.N; i++) {
            const index = i * 3;
            positions[index] = THREE.MathUtils.randFloatSpread(50); // x
            positions[index + 1] = THREE.MathUtils.randFloatSpread(10) + 10; // y
            positions[index + 2] = THREE.MathUtils.randFloatSpread(50); // z
            speeds[i] = 0.1 + Math.random() * 0.2; // Fall speed
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.userData.speeds = speeds; // Store speeds for animation

        const material = new THREE.PointsMaterial({
            color: 'white',
            size: 1,
            map: snowflakeTexture,
            transparent: true,
            depthWrite: false,
        });

        this.snow = new THREE.Points(geometry, material);
        this.scene.add(this.snow);
    }
    updateSnow() {
        const positions = this.snow.geometry.attributes.position.array;
        const speeds = this.snow.geometry.userData.speeds;
        const count = this.N;//speeds.length;
        const time = this.clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            const index = i * 3;
            positions[index] += 0.1 * Math.sin(i / 30 + time / 40); // Sway in x
            positions[index + 1] -= speeds[i]; // Fall in y
            positions[index + 2] += 0.1 * Math.cos(i / 50 + time / 20); // Sway in z

            // Reset snowflake if it falls below the ground
            if (positions[index + 1] < 0) {
                positions[index] = THREE.MathUtils.randFloatSpread(50);
                positions[index + 1] = THREE.MathUtils.randFloatSpread(10) + 10;
                positions[index + 2] = THREE.MathUtils.randFloatSpread(50);
            }
        }

        this.snow.geometry.attributes.position.needsUpdate = true; // Notify Three.js of changes
    }

    handlePinchEnd(event) {
        if (event.touches.length < 2) {
            this.initialDistance = null;
        }
    }
    getDistance(touch1, touch2) {
        const dx = touch1.pageX - touch2.pageX;
        const dy = touch1.pageY - touch2.pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    showLabelDom(label) {
        document.getElementById("label-container").style.opacity = 1;
        this.labelDom.innerText = label;
    }
    hideLabelDom() {
        document.getElementById("label-container").style.opacity = 0;
    }

    moveToNextLabel(labelName) {
        this.zoom = this.zoomInFactor;
        this.showLabelDom(labelName);
        const labelCameraTargets = [
            {
                label: "Kahve Molası",
                camera: { x: 7.69, y: 7, z: 5.78 },
                target: { x: 0.7, y: 0, z: -1.22 },
            },
            {
                label: "İletişim",
                camera: { x: 8.05, y: 7, z: 10.41 },
                target: { x: 1.05, y: 0, z: 3.41 },
            },
            {
                label: "Ana Acentem",
                camera: { x: 7.46, y: 7, z: 7.87 },
                target: { x: 0.63, y: 0, z: 1.04 },
            },
            {
                label: "Ana Sağlık",
                camera: { x: 7.69, y: 7, z: 5.78 },
                target: { x: 0.7, y: 0, z: -1.22 },
            },
            {
                label: "Ana Servis",
                camera: { x: 7.39, y: 7, z: 1.72 },
                target: { x: -0.52, y: 0, z: -5.15 },
            },
            {
                label: "Genel Müdürlük",
                camera: { x: 6.56, y: 7, z: 10.7 },
                target: { x: -0.44, y: 0, z: 4.74 },
            },
            {
                label: "Muhtarlık",
                camera: { x: 15.90, y: 7, z: 7.87 },
                target: { x: 8.90, y: 0, z: 0.87 },
            },
            {
                label: "Anasayfa",
                camera: { x: 4.69, y: 7.0, z: 5.27 },
                target: { x: -2.31, y: 0, z: -1.73 },
            },
        ];
        const targetLabel = labelCameraTargets.filter((labelPositions) => labelPositions.label === labelName);
        if (targetLabel[0]) {
            this.cameraTarget.copy(targetLabel[0].camera);
            this.controlsTarget.copy(targetLabel[0].target);
            this.isMoving = true;
        }
    }

    init() {
        this.clock = new THREE.Clock(true);
        this.setupRenderer();
        this.setupCamera();
        this.setupControls();
        this.setupScene();
        this.setupLights();
        // this.setupStats();
        this.loadCity();
        // this.setupSnow();

        // document.getElementById("btn-next").onclick = () => {
        //     this.activeLabel = (this.activeLabel + 1) % this.labelData.length;
        //     this.moveToNextLabel(this.labelData[this.activeLabel % this.labelData.length].name);
        // };
        // document.getElementById("btn-prev").onclick = () => {
        //     this.activeLabel = (this.activeLabel - 1 + this.labelData.length) % this.labelData.length;
        //     this.moveToNextLabel(this.labelData[this.activeLabel].name);
        // };
        window.addEventListener("resize", this.onWindowResize.bind(this));
        window.addEventListener("wheel", this.zoomHandler.bind(this));
        document.addEventListener("touchstart", this.handlePinchStart.bind(this), { passive: false });
        document.addEventListener("touchmove", this.handlePinchChange.bind(this), { passive: false });
        document.addEventListener("touchend", this.handlePinchEnd.bind(this), { passive: false });

        this.animate();
    }
    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateCars();
        this.animateCamera();
        this.updatePlanes();
        this.controls.update();
        this.updateLights();
        // this.updateSnow();
        // this.stats.update();
        this.renderer.render(this.scene, this.camera);
        if (this.isMoving) {
            if (this.camera.position.distanceToSquared(this.cameraTarget) < 0.2) {
                this.isMoving = false;
            }
            this.camera.position.lerp(this.cameraTarget, 0.1);
            this.controls.target.lerp(this.controlsTarget, 0.1);
        }
    }
}

new Game();
