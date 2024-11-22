import * as THREE from 'three';

class Helicopter {
    constructor(scene, loader, radius, centerX, centerY, color = 'orange', clockwise = true) {
        this.modelPath = "/models/heli.glb";
        this.color = color;
        this.loader = loader;
        this.scene = scene;
        this.model = null;
        this.animations = null;
        this.mixer = null;
        this.curve = this.createPath(radius, centerX, centerY, clockwise);
        this.curveProgress = 0;
        this.loadModel();
    }

    createPath() {
        let startX = 60;
        let startY = 23;
        let startZ = -95;
        let radiusX = 50; // Horizontal radius
        let radiusZ = 80; // Vertical radius
        let minY = 23; // Minimum height
        let maxY = 40; // Maximum height
        let numPoints = 30; // Number of points
        let clockwise = true; // Direction of the ellipse
        const points = [];
        const heightAmplitude = (maxY - minY) / 2; // Half the height range
        const centerHeight = (maxY + minY) / 2; // Middle height

        // Start point
        points.push(new THREE.Vector3(startX, startY, startZ));

        for (let i = 1; i <= numPoints; i++) {
            let angle = (i / numPoints) * Math.PI * 2; // Angle around the ellipse
            angle = clockwise ? angle : -angle;

            const x = radiusX * Math.cos(angle) + startX - radiusX; // Offset to center on startX
            const z = radiusZ * Math.sin(angle) + startZ; // Offset to center on startZ
            const y = Math.sin(angle) + centerHeight;

            points.push(new THREE.Vector3(x, y, z));
        }

        // Ensure smooth looping by ending at the start point
        // points.push(new THREE.Vector3(startX, startY, startZ));

        return new THREE.CatmullRomCurve3(points, true); // Create a closed curve
    }

    setColor() {
        this.model.children[0].children[4].material.color.set(this.color);
    }

    setupAnimations() {
        this.mixer = new THREE.AnimationMixer(this.model);

        this.mixer.clipAction(this.animations[0]).setEffectiveTimeScale(3.0);
        this.mixer.clipAction(this.animations[1]).setEffectiveTimeScale(3.0);
        this.mixer.clipAction(this.animations[0]).play();
        this.mixer.clipAction(this.animations[1]).play();
    }

    loadModel() {
        this.loader.load(this.modelPath, (glb) => {
            this.model = glb.scene;
            this.animations = glb.animations;
            this.scene.add(this.model);
            this.setColor();
            this.setupAnimations();

            const initialPosition = this.curve.getPointAt(this.curveProgress);
            this.model.position.copy(initialPosition);
        });
    }

    animate() {
        if (this.model) {
            this.curveProgress += 0.001;
            if (this.curveProgress > 1) { 
                this.curveProgress = 0;
            }

            const currentPosition = this.curve.getPointAt(this.curveProgress);
            this.model.position.copy(currentPosition);

            const tangent = this.curve.getTangentAt(this.curveProgress);
            const up = new THREE.Vector3(0, 1, 0); // Assume up is always Y-axis
            const quaternion = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, -1), // Forward direction of the model
                tangent
            );
            this.model.setRotationFromQuaternion(quaternion);
        }
    }

    update(delta) {
        if (this.mixer !== null) {
            this.mixer.update(delta);
            this.animate();
        }
    }
}

export default Helicopter;
