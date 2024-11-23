import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import config from './Config';

class Lighting {
    constructor(scene, renderer) {

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        this.light = new THREE.DirectionalLight('white', 2);
        this.light.castShadow = true;
        this.light.position.set(-27, 14, -50);
        this.light.scale.set(10, 10, 10);
        // this.light.lookAt(0, 0, 0);
        this.light.shadow.mapSize.width = 1024;
        this.light.shadow.mapSize.height = 1024;
        this.light.shadow.bias = -0.001;

        config.addRange('light pos Y', (v) => {
            this.light.position.setY(v);
        })

        config.addRange('light pos X', (v) => {
            this.light.position.setX(v);
        }, -100, 100)

        config.addRange('light pos Z', (v) => {
            this.light.position.setZ(v);
        }, -100, 100)

        let helper = new THREE.DirectionalLightHelper(this.light);
        // scene.add(helper)

        // scene.add(this.light.target);
        // scene.add(this.light)
        const hemispehereLight = new THREE.HemisphereLight('blue', 'brown' ,1.0);
        scene.add(hemispehereLight);

        const loader = new RGBELoader();
        loader.load(
            'hdri/city.hdr',
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
                scene.environmentIntensity = 0.9;
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1;
            },
            undefined,
            (error) => {
                console.error('Error loading environment map:', error);
            }
        );
    }

    update(camera, controls) {
        // this.light.target.position.copy(controls.target)
        // this.light.position.x = camera.position.x - 50;
    }
}
export default Lighting;
