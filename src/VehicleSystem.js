import * as THREE from 'three';

class VehicleSystem {

    constructor(scene, loader) {
        this.scene = scene;
        this.direction = new THREE.Vector3(1, 0, 0);
        this.up = new THREE.Vector3(0, 1, 0);

        // this.car = new THREE.Mesh(
        //     new THREE.BoxGeometry(2, 1, 1),
        //     new THREE.MeshNormalMaterial(),
        // ).translateY(0.5);

        loader.load("/cars/suv_1.glb",
            (glb) => {
                this.car = glb.scene;
                scene.add(this.car)

                this.carSize = new THREE.Vector3();
                const carBox = new THREE.Box3().setFromObject(this.car);
                carBox.getSize(this.carSize);
            }
        );

        this.ground = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshBasicMaterial({ color: "green" }),
        ).rotateX(-Math.PI / 2);


        this.groundSize = new THREE.Vector3();
        const groundBox = new THREE.Box3().setFromObject(this.ground);
        groundBox.getSize(this.groundSize);


        this.scene.add(this.ground);
        this.speed = 0.05;
        this.turnDirection = new THREE.Vector3(0, 0, 1).normalize();
    }

    update() {
        if (!this.car) return;
        this.direction.lerp(this.turnDirection, 0.01);

        this.car.position.add(this.direction.clone().multiplyScalar(this.speed));
        const q = new THREE.Quaternion().setFromUnitVectors(this.up, this.direction);
        // this.car.rotation.setFromQuaternion(q);

        // reset the car
        if (this.car.position.x - this.carSize.x / 2 > this.groundSize.x / 2) {
            this.car.position.x = - this.groundSize.x / 2 + this.carSize.x / 2;
        }
    }
}

export default VehicleSystem;
