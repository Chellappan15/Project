import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => {
                video.srcObject = stream;
                video.play();
            })
            .catch((err) => console.log("Error accessing the camera: " + err));
    } else {
        console.log("Media devices not supported");
    }
});

let scene, camera, renderer, model, controls;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    document.getElementById('model-container').appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const light = new THREE.DirectionalLight(0xffffff, 5);
    light.position.set(2, 2, 5).normalize();
    scene.add(light);

    const pointLight = new THREE.PointLight(0xffffff, 2, 50);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    camera.position.z = 5;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enablePan = true;

    loadModel('/models/India Gate.glb');
}

function loadModel(modelPath) {
    if (model) scene.remove(model);

    const loader = new GLTFLoader();
    loader.load(
        modelPath,
        (gltf) => {
            model = gltf.scene;
            model.position.set(0, 0, 0);
            model.scale.set(1, 1, 1);
            scene.add(model);
            render();
        },
        undefined,
        (error) => console.error('An error occurred while loading the model:', error)
    );
}

function render() {
    requestAnimationFrame(render);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
