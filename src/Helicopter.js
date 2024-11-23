import * as THREE from 'three';

class Helicopter {
    constructor({ scene, loader, startX, startZ, radiusX, radiusZ, color = 'orange', speed = 0.001, clockwise = true, height }) {
        this.modelPath = "/models/heli.glb";
        this.color = color;
        this.loader = loader;
        this.speed = speed;
        this.scene = scene;
        this.height = height;
        this.model = null;
        this.animations = null;
        this.mixer = null;
        this.curve = this.createPath(startX, startZ, radiusX, radiusZ, clockwise);
        this.curveProgress = 0;
        this.loadModel();
    }

    createPath(startX, startZ, radiusX, radiusZ, clockwise) {
        const centerHeight = 4;
        let numPoints = 30;
        const points = [];

        for (let i = 0; i < numPoints; i++) {
            let angle = (i / numPoints) * Math.PI * 2;
            angle = clockwise ? angle : -angle;

            const x = radiusX * Math.cos(angle) + startX - radiusX;
            const z = radiusZ * Math.sin(angle) + startZ;
            const y = centerHeight;

            points.push(new THREE.Vector3(x, y, z));
        }

        return new THREE.CatmullRomCurve3(points, true);
    }

    setColor() {
        this.model.children[0].children[4].material.color.set(this.color);
    }

    setupAnimations() {
        this.mixer = new THREE.AnimationMixer(this.model);

        this.mixer.clipAction(this.animations[0]).setEffectiveTimeScale(4.0);
        this.mixer.clipAction(this.animations[1]).setEffectiveTimeScale(4.0);
        this.mixer.clipAction(this.animations[0]).play();
        this.mixer.clipAction(this.animations[1]).play();
    }
    stopAnimations() {
        this.mixer.clipAction(this.animations[0]).stop();
        this.mixer.clipAction(this.animations[1]).stop();
    }

    startAnimations() {
        this.mixer.clipAction(this.animations[0]).play();
        this.mixer.clipAction(this.animations[1]).play();
    }

    loadModel() {
        this.loader.load(this.modelPath, (glb) => {
            this.model = glb.scene;
            this.model.scale.set(1 / 10, 1 / 10, 1 / 10);
            this.animations = glb.animations;
            this.scene.add(this.model);
            this.setColor();
            this.setupAnimations();

            const initialPosition = this.curve.getPointAt(this.curveProgress);
            this.model.position.copy(initialPosition);
        });
        this.animationEnded = false;
        this.goingUp = false;
    }

    animate() {
        if (this.model) {
            if (this.curveProgress > 1 - this.speed) {
                this.animationEnded = true;
            }
            if (this.goingUp) {
                if (this.model.position.y < 4) {
                    this.model.position.y += 0.01;
                    // this.model.position.z += 0.2;
                } else {
                    this.animationEnded = false;
                    this.goingUp = false;
                    this.curveProgress = 0;
                    this.startAnimations();
                }
            }
            if (this.animationEnded && !this.goingUp) {
                if (this.model.position.y > this.height) {
                    this.model.position.y -= 0.01;
                    if (this.model.position.y < 2.2) {
                        this.stopAnimations();
                        setTimeout(() => {
                            this.startAnimations();
                            this.goingUp = true;
                        }, 1000 * 1000 * this.speed * 2);
                    }
                }
            }
            if (!this.animationEnded) {
                this.curveProgress += this.speed;
                const currentPosition = this.curve.getPointAt(this.curveProgress);
                this.model.position.copy(currentPosition);

                const tangent = this.curve.getTangentAt(this.curveProgress);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
                this.model.setRotationFromQuaternion(quaternion);
            }
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
