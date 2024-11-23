import * as THREE from 'three';

class Intersection {
    constructor(scene, x, z, turnDir) {
        this.x = x;
        this.z = z;
        this.turnDir = turnDir;
        this.visual = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshNormalMaterial(),
        );
        this.visual.position.set(x, 0.5, z);
        // scene.add(this.visual);
    }
}

export const Dirs = {
    NORTH: new THREE.Vector3(0, 0, -1),
    SOUTH: new THREE.Vector3(0, 0, 1),
    EAST: new THREE.Vector3(1, 0, 0),
    WEST: new THREE.Vector3(-1, 0, 0),
}

class VehicleSystem {
    constructor({ scene, loader, modelPath, x, y, speed, initDir }) {
        this.scene = scene;
        this.modelPath = modelPath;
        this.turnRadius = 0.50;
        this.direction = initDir.clone();
        this.up = new THREE.Vector3(0, 1, 0);
        this.speed = speed;
        this.turnDirection = initDir.clone();
        this.turnCoolOff = true;
        this.turnCoolOffDuration = 500;

        this.inters = [
            new Intersection(this.scene, 0, 0, [Dirs.NORTH, Dirs.EAST]),
            new Intersection(this.scene, 0, -6, [Dirs.EAST, Dirs.SOUTH /* Dirs.NORTH */]),

            new Intersection(this.scene, 6, 0, [Dirs.NORTH, Dirs.EAST, Dirs.WEST]),
            new Intersection(this.scene, 6, -6, [Dirs.SOUTH, Dirs.WEST, Dirs.SOUTH]),

            new Intersection(this.scene, 12, 0, [Dirs.NORTH, Dirs.EAST, Dirs.WEST]),
            new Intersection(this.scene, 12, -6, [Dirs.SOUTH, Dirs.EAST]),

            new Intersection(this.scene, 18, 0, [Dirs.NORTH, Dirs.EAST, Dirs.WEST]),
            new Intersection(this.scene, 18, -6, [Dirs.SOUTH, Dirs.EAST, Dirs.WEST]),

            new Intersection(this.scene, 24, 0, [Dirs.NORTH]),
            new Intersection(this.scene, 24, -6, [Dirs.SOUTH, Dirs.WEST]),
        ];

        loader.load(modelPath,
            (glb) => {
                this.car = glb.scene;
                this.car.scale.set(1 / 10, 1 / 10, 1 / 10);
                this.car.position.x = x;
                this.car.position.z = y;
                scene.add(this.car);
            }
        );

    }

    checkCollision() {
        let carX = this.car.position.x;
        let carZ = this.car.position.z;

        this.inters.forEach((inter, index) => {
            let squareDist = Math.pow((carX - inter.x), 2) + Math.pow((carZ - inter.z), 2);
            if (squareDist < 0.3 && this.turnCoolOff) {

                let validDirs = inter.turnDir.filter(dir => {
                    return !(
                        (this.turnDirection.x === -dir.x && this.turnDirection.z === -dir.z)
                    );
                });

                if (validDirs.length > 0) {
                    let newDir = validDirs[Math.floor(Math.random() * validDirs.length)];
                    console.log(`${this.modelPath}: Direction updated: ${this.turnDirection.toArray()} -> ${newDir.toArray()}`);
                    this.turnDirection.copy(newDir);
                } else {
                    console.warn(`No valid turn directions at intersection ${index}`);
                }

                // debounce prevention
                this.turnCoolOff = false;
                setTimeout(() => this.turnCoolOff = true, this.turnCoolOffDuration);
            }
        })
    }

    update() {
        if (!this.car) return;

        this.checkCollision();

        // Strictly move along the current direction
        const moveVector = this.turnDirection.clone().multiplyScalar(this.speed);
        this.car.position.add(moveVector);
        this.direction.lerp(this.turnDirection, this.turnRadius);

        const q = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(-1, 0, 0),
            this.direction.normalize()
        );
        this.car.rotation.setFromQuaternion(q);

    }
}

export { Intersection, VehicleSystem };
