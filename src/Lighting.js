import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

class Lighting {
    constructor(scene, renderer) {

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 50);
        pointLight.position.set(-5, 5, 5);
        scene.add(pointLight);

        const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.5);
        hemisphereLight.position.set(0, 10, 0);
        scene.add(hemisphereLight);

        const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 2);
        scene.add(hemisphereLightHelper);

        const loader = new RGBELoader();
        loader.load(
            'hdri/city.hdr',
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
                scene.background = texture;
                renderer.toneMapping = THREE.ACESFilmicToneMapping;
                renderer.toneMappingExposure = 1;
            },
            undefined,
            (error) => {
                console.error('Error loading environment map:', error);
            }
        );
    }
}
export default Lighting;
