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

    createPath(radius, centerX, centerY, clockwise, heightVariation = 3) {
        const points = [];
        const numPoints = 50;

        for (let i = 0; i <= numPoints; i++) {
            let angle = (i / numPoints) * Math.PI * 2; // Angle for the circular path
            angle = clockwise ? angle: -angle;
            
            const x = radius * Math.cos(angle) + centerX + (Math.random()); // X coordinate
            const z = radius * Math.sin(angle) + centerY + (Math.random()); // Z coordinate
            const y = Math.cos(angle * 2) * heightVariation + 50; // Height variation
            points.push(new THREE.Vector3(x, y, z));
        }

        return new THREE.CatmullRomCurve3(points, true);
    }

    setColor() {
        this.model.children[0].children[4].material.color.set(this.color);
    }

    setupAnimations() {
        this.mixer = new THREE.AnimationMixer(this.model);
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
            if (this.curveProgress > 1) this.curveProgress = 0;

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
