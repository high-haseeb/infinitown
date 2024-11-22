import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

class Lighting {
    constructor(scene, renderer) {

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        this.light = new THREE.DirectionalLight('white', 1);
        this.light.castShadow = true;
        this.light.position.set(-10, 4, -10);
        this.light.lookAt(0, 0, 0);
        this.light.shadow.mapSize.width = 1024;
        this.light.shadow.mapSize.height = 1024;
        this.light.shadow.bias = -0.001;

        // let helper = new THREE.DirectionalLightHelper(this.light);
        // scene.add(helper)

        scene.add(this.light.target);
        scene.add(this.light)

        const loader = new RGBELoader();
        loader.load(
            'hdri/city.hdr',
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
                scene.environmentIntensity = 0.3;
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
        this.light.target.position.copy(controls.target)
        this.light.position.x = camera.position.x - 50;
    }
}
export default Lighting;
