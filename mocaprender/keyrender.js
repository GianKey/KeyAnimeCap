import { BVHLoader } from "./BVHLoader.js";
let orbitCamera, orbitControls, scene, renderer;
let mixer;

var ipcRenderer = null;

import {animateVRM} from "./animate/animate_vrm.js"

function initRender(){

    // camera
    orbitCamera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 1000);
    orbitCamera.position.set(0.0, 1.4, 0.7);

    // scene
    scene = new THREE.Scene();

    scene.background = new THREE.Color( 0xeeeeee );
    scene.add( new THREE.GridHelper( 10, 10 ) );

    // renderer
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: globalSettings.output.antialias,
    });
    renderer.setSize(
        document.querySelector("#model").clientWidth,
        (document.querySelector("#model").clientWidth / 16) * 9
    );
    renderer.setPixelRatio(window.devicePixelRatio);


    // controls
    orbitControls = new THREE.OrbitControls(orbitCamera, renderer.domElement);
    orbitControls.screenSpacePanning = true;
    orbitControls.target.set(0.0, 1.4, 0.0);
    orbitControls.update();

    window.addEventListener(
        "resize",onWindowResize,false);
      
}


function onWindowResize () {
    orbitCamera.aspect = 16 / 9;
    orbitCamera.updateProjectionMatrix();
    renderer.setSize(
        document.querySelector("#model").clientWidth,
        (document.querySelector("#model").clientWidth / 16) * 9
    );
}
