

// import setting utils


const globalSettings = window.parent.window.keyanimecapApp.settings;


const keybvhloader = require("./BVHLoader.js").keybvhloader;
var hipRotationOffset = 0.2
var bvhSkeletonHelper, bvhMixer;

let orbitCamera, orbitControls, scene, renderer;


// set theme
document.body.setAttribute(
    "class",
    "mdui-theme-layout-auto mdui-theme-primary-" +
        globalSettings.ui.themeColor +
        " mdui-theme-accent-" +
        globalSettings.ui.themeColor
);

var ipcRenderer = null;
if (globalSettings.forward.enableForwarding)
    ipcRenderer = require("electron").ipcRenderer;
// my_server = require("../webserv/server.js");

const ainmate_vrm = require( "./animate/animate_vrm.js")

// import Helper Functions from Kalidokit
// const remap = Kalidokit.Utils.remap;
// const clamp = Kalidokit.Utils.clamp;
// const lerp = Kalidokit.Vector.lerp;

// VRM object
let currentVrm = null;

// Whether mediapipe ready
var started = false;

// key
var isbeginPlay = false;
///



function initRender(){

    // camera
    // orbitCamera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 1000);
    // orbitCamera.position.set(0.0, 1.4, 0.7);

    orbitCamera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 2000 );
    orbitCamera.position.set(0, 200,-300);
    // scene
    scene = new THREE.Scene();

    scene.background = new THREE.Color( 0xeeeeee );
    // const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    // mesh.rotation.x = - Math.PI / 2;
    // mesh.receiveShadow = true;
    // scene.add(mesh);

    const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

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

    const light = new THREE.AmbientLight(0xffffff, 0.8);
    light.position.set(10.0, 10.0, -10.0).normalize();
    scene.add(light);
    var light2 = new THREE.DirectionalLight(0xffffff, 1);
    light2.position.set(0, 3, -2);
    light2.castShadow = true;
    scene.add(light2);



    // controls
    orbitControls = new THREE.OrbitControls(orbitCamera, renderer.domElement);
    orbitControls.screenSpacePanning = true;
    orbitControls.target.set(0, 100, 0.0);
    orbitControls.update();

    window.addEventListener(
        "resize",onWindowResize,false);
      
}

initRender();
document.querySelector("#model").appendChild(renderer.domElement);
document.getElementById("videolist").src = "video/videolist.html";

function onWindowResize () {
    orbitCamera.aspect = 16 / 9;
    orbitCamera.updateProjectionMatrix();
    renderer.setSize(
        document.querySelector("#model").clientWidth,
        (document.querySelector("#model").clientWidth / 16) * 9
    );
}


// stats

const statsContainer = document.getElementById("status");

if (!globalSettings.output.showFPS) {
    statsContainer.style.display = "none";
}

const stats = new Stats();
stats.domElement.style.position = "absolute";
stats.domElement.style.top = "26px";
stats.domElement.style.left = "10px";
statsContainer.appendChild(stats.dom);

const stats2 = new Stats();
stats2.domElement.style.position = "absolute";
stats2.domElement.style.top = "26px";
stats2.domElement.style.left = "100px";
statsContainer.appendChild(stats2.dom);

// Main Render Loop
const clock = new THREE.Clock();

var isRecordingStarted = false;

function animate() {
    requestAnimationFrame(animate);

    stats.update();
    // if ( mixer ) {
    //     mixer.update(clock.getDelta())
    // };

    if(bvhMixer){
        bvhMixer.update( clock.getDelta());
        //THREE.SkeletonUtils.retarget( model, bvhSkeletonHelper, options );
    }
    if (currentVrm) {
        // Update model to render physics
        currentVrm.update(clock.getDelta());
    }
    renderer.render(scene, orbitCamera);

    if(isRecordingStarted)html2canvas(elementToRecord).then(function (canvas) {
        //context.clearRect(0, 0, canvas2d.width, canvas2d.height);
        context.drawImage(canvas, 0, 0, canvas2d.width, canvas2d.height);
    });
}


var modelObj = JSON.parse(localStorage.getItem("modelInfo"));
var modelPath = modelObj.path;

var fileType = modelPath
    .substring(modelPath.lastIndexOf(".") + 1)
    .toLowerCase();



// init server
if (ipcRenderer)
    ipcRenderer.send(
        "startWebServer",
        parseInt(globalSettings.forward.port),
        JSON.stringify(modelObj),
        globalSettings.forward.supportForWebXR
    );


var initRotation = {};
var skeletonHelper = null;
var model = null;
function loadermodel(){
    scene.remove(model);
    scene.remove(skeletonHelper);
    modelObj = JSON.parse(localStorage.getItem("modelInfo"));
    modelPath = modelObj.path;
    var loader = null;
    if (fileType == "fbx") {
        loader = new THREE.FBXLoader();
    } else {
        loader = new THREE.GLTFLoader();
    }
    // Import Character
    
    loader.crossOrigin = "anonymous";
    loader.load(
        modelPath,
    
        (gltf) => {
           // var model = null;
            if (fileType == "fbx") {
                gltf.scale.set(1, 1, 1);
                
                model = gltf;
                model.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.frustumCulled = false
                    }
                });
                
                if (!model.skeleton) {
                    model.traverse((child) => {
                        if (!model.skeleton && child.skeleton) {
                            model.skeleton = child.skeleton;
                        }
                    });
                }
            } else {
                model = gltf.scene;
            }
            if (fileType == "vrm") {
                // calling these functions greatly improves the performance
                THREE.VRMUtils.removeUnnecessaryVertices(gltf.scene);
                THREE.VRMUtils.removeUnnecessaryJoints(gltf.scene);
    
                THREE.VRM.from(gltf).then((vrm) => {
                    scene.add(vrm.scene);
                    currentVrm = vrm;
                    currentVrm.scene.rotation.y = Math.PI; // Rotate model 180deg to face camera
                });
            } else {
                skeletonHelper = new THREE.SkeletonHelper(model.skeleton.bones[0]);
                skeletonHelper.visible = true;
                scene.add(skeletonHelper);
                // for glb files
                scene.add(model);
                model.rotation.y = Math.PI; // Rotate model 180deg to face camera
           
                //orbitControls.target.y = 0.5;
                orbitControls.update();
    
                if (modelObj.cameraTarget) {
                    orbitControls.target.set(
                        modelObj.cameraTarget.x,
                        modelObj.cameraTarget.y,
                        modelObj.cameraTarget.z
                    );
                    orbitControls.update();
                }
    
                if (modelObj.cameraPosition) {
                    for (var i in modelObj.cameraPosition)
                        orbitCamera.position[i] = modelObj.cameraPosition[i];
                }
                if (modelObj.cameraRotation) {
                    for (var i in modelObj.cameraRotation)
                        orbitCamera.rotation[i] = modelObj.cameraRotation[i];
                }
    
                if (modelObj.init) {
                    initRotation = modelObj.init;
                }
            }
            // bvhloader.load('./animate/7fdad48bf7024d7580d0c4d680c2a691.bvh', function ( result ) {
            //     bvhSkeletonHelper = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );
            //     bvhSkeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to THREE.SkeletonHelper directly
            
            //     //var boneContainer = new THREE.Group();
            //     // boneContainer.add( result.skeleton.bones[ 0 ] );
            //     // boneContainer.position.z = - 100;
            //     // boneContainer.position.y = - 100;
            //     //scene.add( result.skeleton.bones[ 0 ] );
            //     //scene.add( bvhSkeletonHelper );
            //     //scene.add( boneContainer );
                
            //     // get offsets when it is in T-Pose
            //     options.fps = 1 / result.clip.tracks[0].times[1];
            //     //options.offsets = THREE.SkeletonUtils.getSkeletonOffsets( model, bvhSkeletonHelper, options );
                
            //     let newClip = THREE.SkeletonUtils.retargetClip(model, bvhSkeletonHelper, result.clip, options);
               
            //     // play animation
            //     bvhMixer = new THREE.AnimationMixer( model );
            //     //bvhMixer.clipAction( result.clip ).setEffectiveWeight( 1.0 ).play();
            //     //THREE.SkeletonUtils.retarget( model, bvhSkeletonHelper, options );
            //     // bvhaction = bvhMixer.clipAction(newClip);
            //     // bvhaction.setEffectiveWeight( 1.0 );
            //     // bvhaction.play();
            //     //bvhMixer.clipAction(newClip).setEffectiveWeight( 1.0 ).play();
            //     bvhMixer.clipAction(newClip).play();
            // }
            //  );
        },
    
        (progress) =>
            console.log(
                "Loading model...",
                100.0 * (progress.loaded / progress.total),
                "%"
            ),
    
        (error) => console.error(error)
    );
}

// Import model from URL, add your own model here
loadermodel();

//animate();

var options;
var h36moptions;
var mixamo1Options;
var h36moptionsmixamo1;
options = {
    hip: "Hips",
    // left is SEA3D bone names and right BVH bone names
    names: {
        "mixamorigHips" : "Hips",
        "mixamorigSpine" : "Spine",
        "mixamorigSpine1" : "",
        "mixamorigSpine2" : "Spine3",
        "mixamorigNeck" : "Neck",
        "mixamorigHead" : "Head",

        "mixamorigLeftShoulder" : "shoulder.L",
        "mixamorigLeftArm" : "LeftArm",
        "mixamorigLeftForeArm" : "LeftForeArm",
        "mixamorigLeftHand" : "LeftHand",

        "mixamorigLeftHandThumb1" : "f_thumb.01.L",
        "mixamorigLeftHandThumb2" : "f_thumb.02.L",
        "mixamorigLeftHandThumb3" : "f_thumb.03.L",

        "mixamorigLeftHandIndex1" : "f_index.01.L",
        "mixamorigLeftHandIndex2" : "f_index.02.L",
        "mixamorigLeftHandIndex3" : "f_index.03.L",

        "mixamorigLeftHandMiddle1" : "f_middle.01.L",
        "mixamorigLeftHandMiddle2" : "f_middle.02.L",
        "mixamorigLeftHandMiddle3" : "f_middle.03.L",

        "mixamorigLeftHandRing1" : "f_ring.01.L",
        "mixamorigLeftHandRing2" : "f_ring.02.L",
        "mixamorigLeftHandRing3" : "f_ring.03.L",

        "mixamorigLeftHandPinky1" : "f_pinky.01.L",
        "mixamorigLeftHandPinky2" : "f_pinky.02.L",
        "mixamorigLeftHandPinky3" : "f_pinky.03.L",

        "mixamorigRightShoulder" : "shoulder.R",
        "mixamorigRightArm" : "RightArm",
        "mixamorigRightForeArm" : "RightForeArm",
        "mixamorigRightHand" : "RightHand",

        "mixamorigRightHandThumb1" : "f_thumb.01.R",
        "mixamorigRightHandThumb2" : "f_thumb.02.R",
        "mixamorigRightHandThumb3" : "f_thumb.03.R",

        "mixamorigRightHandIndex1" : "f_index.01.R",
        "mixamorigRightHandIndex2" : "f_index.02.R",
        "mixamorigRightHandIndex3" : "f_index.03.R",

        "mixamorigRightHandMiddle1" : "f_middle.01.R",
        "mixamorigRightHandMiddle2" : "f_middle.02.R",
        "mixamorigRightHandMiddle3" : "f_middle.03.R",

        "mixamorigRightHandRing1" : "f_ring.01.R",
        "mixamorigRightHandRing2" : "f_ring.02.R",
        "mixamorigRightHandRing3" : "f_ring.03.R",

        "mixamorigRightHandPinky1" : "f_pinky.01.R",
        "mixamorigRightHandPinky2" : "f_pinky.02.R",
        "mixamorigRightHandPinky3" : "f_pinky.03.R",

        "mixamorigLeftUpLeg" : "LeftUpLeg",
        "mixamorigLeftLeg" : "LeftLeg",
        "mixamorigLeftFoot" : "LeftFoot",
        "mixamorigLeftToeBase" : "LeftFoot_End",

        "mixamorigRightUpLeg" : "RightUpLeg",
        "mixamorigRightLeg" : "RightLeg",
        "mixamorigRightFoot" : "RightFoot",
        "mixamorigRightToeBase" : "RightFoot_End"
    }
};
h36moptions = {
    hip: "Hip",
    // left is SEA3D bone names and right BVH bone names
    names: {
        "mixamorigHips" : "Hip",
        "mixamorigSpine" : "Spine",
        "mixamorigSpine1" : "",
        "mixamorigSpine2" : "Thorax",
        "mixamorigNeck" : "Neck",
        "mixamorigHead" : "HeadEndSite",

        "mixamorigLeftShoulder" : "",
        "mixamorigLeftArm" : "LeftShoulder",
        "mixamorigLeftForeArm" : "LeftElbow",
        "mixamorigLeftHand" : "LeftWrist",

        "mixamorigLeftHandThumb1" : "f_thumb.01.L",
        "mixamorigLeftHandThumb2" : "f_thumb.02.L",
        "mixamorigLeftHandThumb3" : "f_thumb.03.L",

        "mixamorigLeftHandIndex1" : "f_index.01.L",
        "mixamorigLeftHandIndex2" : "f_index.02.L",
        "mixamorigLeftHandIndex3" : "f_index.03.L",

        "mixamorigLeftHandMiddle1" : "f_middle.01.L",
        "mixamorigLeftHandMiddle2" : "f_middle.02.L",
        "mixamorigLeftHandMiddle3" : "f_middle.03.L",

        "mixamorigLeftHandRing1" : "f_ring.01.L",
        "mixamorigLeftHandRing2" : "f_ring.02.L",
        "mixamorigLeftHandRing3" : "f_ring.03.L",

        "mixamorigLeftHandPinky1" : "f_pinky.01.L",
        "mixamorigLeftHandPinky2" : "f_pinky.02.L",
        "mixamorigLeftHandPinky3" : "f_pinky.03.L",

        "mixamorigRightShoulder" : "",
        "mixamorigRightArm" : "RightShoulder",
        "mixamorigRightForeArm" : "RightElbow",
        "mixamorigRightHand" : "RightWrist",

        "mixamorigRightHandThumb1" : "f_thumb.01.R",
        "mixamorigRightHandThumb2" : "f_thumb.02.R",
        "mixamorigRightHandThumb3" : "f_thumb.03.R",

        "mixamorigRightHandIndex1" : "f_index.01.R",
        "mixamorigRightHandIndex2" : "f_index.02.R",
        "mixamorigRightHandIndex3" : "f_index.03.R",

        "mixamorigRightHandMiddle1" : "f_middle.01.R",
        "mixamorigRightHandMiddle2" : "f_middle.02.R",
        "mixamorigRightHandMiddle3" : "f_middle.03.R",

        "mixamorigRightHandRing1" : "f_ring.01.R",
        "mixamorigRightHandRing2" : "f_ring.02.R",
        "mixamorigRightHandRing3" : "f_ring.03.R",

        "mixamorigRightHandPinky1" : "f_pinky.01.R",
        "mixamorigRightHandPinky2" : "f_pinky.02.R",
        "mixamorigRightHandPinky3" : "f_pinky.03.R",

        "mixamorigLeftUpLeg" : "LeftHip",
        "mixamorigLeftLeg" : "LeftKnee",
        "mixamorigLeftFoot" : "LeftAnkle",
        "mixamorigLeftToeBase" : "LeftAnkleEndSite",

        "mixamorigRightUpLeg" : "RightHip",
        "mixamorigRightLeg" : "RightKnee",
        "mixamorigRightFoot" : "RightAnkle",
        "mixamorigRightToeBase" : "RightAnkleEndSite"
    }
};

var mixamo1Options = {
    hip: "RightFoot_End",
    // left is SEA3D bone names and right BVH bone names
    names: {
        "mixamorig1Hips" : "Hips",
        "mixamorig1Spine" : "Spine",
        "mixamorig1Spine1" : "",
        "mixamorig1Spine2" : "Spine3",
        "mixamorig1Neck" : "Neck",
        "mixamorigHead" : "Head",

        "mixamorig1LeftShoulder" : "shoulder.L",
        "mixamorig1LeftArm" : "LeftArm",
        "mixamorig1LeftForeArm" : "LeftForeArm",
        "mixamorig1LeftHand" : "LeftHand",

        "mixamorig1LeftHandThumb1" : "f_thumb.01.L",
        "mixamorig1LeftHandThumb2" : "f_thumb.02.L",
        "mixamorig1LeftHandThumb3" : "f_thumb.03.L",

        "mixamorig1LeftHandIndex1" : "f_index.01.L",
        "mixamorig1LeftHandIndex2" : "f_index.02.L",
        "mixamorig1LeftHandIndex3" : "f_index.03.L",

        "mixamorig1LeftHandMiddle1" : "f_middle.01.L",
        "mixamorig1LeftHandMiddle2" : "f_middle.02.L",
        "mixamorig1LeftHandMiddle3" : "f_middle.03.L",

        "mixamorig1LeftHandRing1" : "f_ring.01.L",
        "mixamorig1LeftHandRing2" : "f_ring.02.L",
        "mixamorig1LeftHandRing3" : "f_ring.03.L",

        "mixamorig1LeftHandPinky1" : "f_pinky.01.L",
        "mixamorig1LeftHandPinky2" : "f_pinky.02.L",
        "mixamorig1LeftHandPinky3" : "f_pinky.03.L",

        "mixamorig1RightShoulder" : "shoulder.R",
        "mixamorig1RightArm" : "RightArm",
        "mixamorig1RightForeArm" : "RightForeArm",
        "mixamorig1RightHand" : "RightHand",

        "mixamorig1RightHandThumb1" : "f_thumb.01.R",
        "mixamorig1RightHandThumb2" : "f_thumb.02.R",
        "mixamorig1RightHandThumb3" : "f_thumb.03.R",

        "mixamorig1RightHandIndex1" : "f_index.01.R",
        "mixamorig1RightHandIndex2" : "f_index.02.R",
        "mixamorig1RightHandIndex3" : "f_index.03.R",

        "mixamorig1RightHandMiddle1" : "f_middle.01.R",
        "mixamorig1RightHandMiddle2" : "f_middle.02.R",
        "mixamorig1RightHandMiddle3" : "f_middle.03.R",

        "mixamorig1RightHandRing1" : "f_ring.01.R",
        "mixamorig1RightHandRing2" : "f_ring.02.R",
        "mixamorig1RightHandRing3" : "f_ring.03.R",

        "mixamorig1RightHandPinky1" : "f_pinky.01.R",
        "mixamorig1RightHandPinky2" : "f_pinky.02.R",
        "mixamorig1RightHandPinky3" : "f_pinky.03.R",

        "mixamorig1LeftUpLeg" : "LeftUpLeg",
        "mixamorigLeftLeg" : "LeftLeg",
        "mixamorig1LeftFoot" : "LeftFoot",
        "mixamorig1LeftToeBase" : "LeftFoot_End",

        "mixamorig1RightUpLeg" : "RightUpLeg",
        "mixamorig1RightLeg" : "RightLeg",
        "mixamorig1RightFoot" : "RightFoot",
        "mixamorig1RightToeBase" : "RightFoot_End"
    }
};
h36moptionsmixamo1 = {
    hip: "Hip",
    // left is SEA3D bone names and right BVH bone names
    names: {
        "mixamorig1Hips" : "Hip",
        "mixamorig1Spine" : "Spine",
        "mixamorig1Spine1" : "",
        "mixamorig1Spine2" : "Thorax",
        "mixamorig1Neck" : "Neck",
        "mixamorig1Head" : "HeadEndSite",

        "mixamorig1LeftShoulder" : "",
        "mixamorig1LeftArm" : "LeftShoulder",
        "mixamorig1LeftForeArm" : "LeftElbow",
        "mixamorig1LeftHand" : "LeftWrist",

        "mixamorig1LeftHandThumb1" : "f_thumb.01.L",
        "mixamorig1LeftHandThumb2" : "f_thumb.02.L",
        "mixamorig1LeftHandThumb3" : "f_thumb.03.L",

        "mixamorig1LeftHandIndex1" : "f_index.01.L",
        "mixamorig1LeftHandIndex2" : "f_index.02.L",
        "mixamorig1LeftHandIndex3" : "f_index.03.L",

        "mixamorig1LeftHandMiddle1" : "f_middle.01.L",
        "mixamorig1LeftHandMiddle2" : "f_middle.02.L",
        "mixamorig1LeftHandMiddle3" : "f_middle.03.L",

        "mixamorig1LeftHandRing1" : "f_ring.01.L",
        "mixamorig1LeftHandRing2" : "f_ring.02.L",
        "mixamorig1LeftHandRing3" : "f_ring.03.L",

        "mixamorig1LeftHandPinky1" : "f_pinky.01.L",
        "mixamorig1LeftHandPinky2" : "f_pinky.02.L",
        "mixamorig1LeftHandPinky3" : "f_pinky.03.L",

        "mixamorig1RightShoulder" : "",
        "mixamorig1RightArm" : "RightShoulder",
        "mixamorig1RightForeArm" : "RightElbow",
        "mixamorig1RightHand" : "RightWrist",

        "mixamorig1RightHandThumb1" : "f_thumb.01.R",
        "mixamorig1RightHandThumb2" : "f_thumb.02.R",
        "mixamorig1RightHandThumb3" : "f_thumb.03.R",

        "mixamorig1RightHandIndex1" : "f_index.01.R",
        "mixamorig1RightHandIndex2" : "f_index.02.R",
        "mixamorig1RightHandIndex3" : "f_index.03.R",

        "mixamorig1RightHandMiddle1" : "f_middle.01.R",
        "mixamorig1RightHandMiddle2" : "f_middle.02.R",
        "mixamorig1RightHandMiddle3" : "f_middle.03.R",

        "mixamorig1RightHandRing1" : "f_ring.01.R",
        "mixamorig1RightHandRing2" : "f_ring.02.R",
        "mixamorig1RightHandRing3" : "f_ring.03.R",

        "mixamorig1RightHandPinky1" : "f_pinky.01.R",
        "mixamorig1RightHandPinky2" : "f_pinky.02.R",
        "mixamorig1RightHandPinky3" : "f_pinky.03.R",

        "mixamorig1LeftUpLeg" : "LeftHip",
        "mixamorig1LeftLeg" : "LeftKnee",
        "mixamorig1LeftFoot" : "LeftAnkle",
        "mixamorig1LeftToeBase" : "LeftAnkleEndSite",

        "mixamorig1RightUpLeg" : "RightHip",
        "mixamorig1RightLeg" : "RightKnee",
        "mixamorig1RightFoot" : "RightAnkle",
        "mixamorig1RightToeBase" : "RightAnkleEndSite"
    }
};

const bvhloader = new keybvhloader();
let bvhres;



let videoElement = document.querySelector(".input_video"),
    guideCanvas = document.querySelector("canvas.guides");

const onResults = (results) => {
    stats2.update();
    // Draw landmark guides
    if (globalSettings.preview.showSketelonOnInput) drawResults(results);
    // Animate model
    ainmate_vrm.ainmate_vrm(currentVrm, results);
    if (!started) {
        //document.getElementById("loading").style.display = 'none';
        //document.getElementById("loading").style.display = 'flex';
        if (localStorage.getItem("useCamera") == "file") videoElement.play();
        started = true;
    }
};

const holistic = new Holistic({
    locateFile: (file) => {
        if (typeof require != "undefined")
            return __dirname + `/../node_modules/@mediapipe/holistic/${file}`;
        else return `../node_modules/@mediapipe/holistic/${file}`;
    },
});

holistic.setOptions({
    modelComplexity: parseInt(globalSettings.mediapipe.modelComplexity),
    smoothLandmarks: globalSettings.mediapipe.smoothLandmarks,
    minDetectionConfidence: parseFloat(
        globalSettings.mediapipe.minDetectionConfidence
    ),
    minTrackingConfidence: parseFloat(
        globalSettings.mediapipe.minTrackingConfidence
    ),
    refineFaceLandmarks: globalSettings.mediapipe.refineFaceLandmarks,
});
// Pass holistic a callback function
holistic.onResults(onResults);


const drawResults = (results) => {
    guideCanvas.width = videoElement.videoWidth;
    guideCanvas.height = videoElement.videoHeight;
    let canvasCtx = guideCanvas.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
    // Use `Mediapipe` drawing functions
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
        color: "#00cff7",
        lineWidth: 4,
    });
    drawLandmarks(canvasCtx, results.poseLandmarks, {
        color: "#ff0364",
        lineWidth: 2,
    });
    drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
        color: "#C0C0C070",
        lineWidth: 1,
    });
    if (results.faceLandmarks && results.faceLandmarks.length === 478) {
        //draw pupils
        drawLandmarks(
            canvasCtx,
            [results.faceLandmarks[468], results.faceLandmarks[468 + 5]],
            {
                color: "#ffe603",
                lineWidth: 2,
            }
        );
    }
    drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
        color: "#eb1064",
        lineWidth: 5,
    });
    drawLandmarks(canvasCtx, results.leftHandLandmarks, {
        color: "#00cff7",
        lineWidth: 2,
    });
    drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
        color: "#22c3e3",
        lineWidth: 5,
    });
    drawLandmarks(canvasCtx, results.rightHandLandmarks, {
        color: "#ff0364",
        lineWidth: 2,
    });
};

//key
function keyStartMocap() {
// switch use camera or video file
if (localStorage.getItem("useCamera") == "camera") {
    navigator.mediaDevices
        .getUserMedia({
            video: {
                deviceId: localStorage.getItem("cameraId"),
                width: 1280,
                height: 720,
            },
        })
        .then(function (stream) {
            videoElement.srcObject = stream;
            videoElement.play();
            var videoFrameCallback = async () => {
                // videoElement.pause()
                await holistic.send({ image: videoElement });
                videoElement.requestVideoFrameCallback(videoFrameCallback);
                // videoElement.play()
            };

            videoElement.requestVideoFrameCallback(videoFrameCallback);
        })
        .catch(function (err0r) {
            alert(err0r);
        });
} else {
    // path of video file
    videoElement.src = localStorage.getItem("videoFile");
    videoElement.loop = true;
    videoElement.controls = true;

    document.querySelector("#model").style.transform = "scale(-1, 1)";

    videoElement.style.transform = "";
    guideCanvas.style.transform = "";

    var videoFrameCallback = async () => {
        // videoElement.pause()
        await holistic.send({ image: videoElement });
        videoElement.requestVideoFrameCallback(videoFrameCallback);
        // videoElement.play()
    };

    videoElement.requestVideoFrameCallback(videoFrameCallback);
}
//}}
}

//key
function keyStartMMposeMocap() {
    // switch use camera or video file
    //document.getElementById("loading").style.display = 'flex';
    if (localStorage.getItem("useCamera") == "camera") {
        navigator.mediaDevices
            .getUserMedia({
                video: {
                    deviceId: localStorage.getItem("cameraId"),
                    width: 1280,
                    height: 720,
                },
            })
            .then(function (stream) {
                videoElement.srcObject = stream;
                videoElement.play();
                var videoFrameCallback = async () => {
                    // videoElement.pause()
                    await holistic.send({ image: videoElement });
                    videoElement.requestVideoFrameCallback(videoFrameCallback);
                    // videoElement.play()
                };
    
                videoElement.requestVideoFrameCallback(videoFrameCallback);
            })
            .catch(function (err0r) {
                alert(err0r);
            });
    } else {
        // path of video file
        videoElement.src = localStorage.getItem("videoFile");
        videoElement.loop = true;
        videoElement.controls = true;
    
        document.querySelector("#model").style.transform = "scale(-1, 1)";
    
        videoElement.style.transform = "";
        guideCanvas.style.transform = "";
    
        var videoFrameCallback = async () => {
            // videoElement.pause()
            //await holistic.send({ image: videoElement });
            videoElement.requestVideoFrameCallback(videoFrameCallback);
            // videoElement.play()
        };

        videoElement.requestVideoFrameCallback(videoFrameCallback);
    }
    //}}
    }

function displayWaitting2None(){
    document.getElementById("loading").style.display = 'none';
}

function displayWaitting(){
    document.getElementById("loading").style.display = 'flex';
}

function resetModelPose(){
    if(bvhMixer)
    {
        bvhMixer.stopAllAction();
        model.skeleton.pose();
    }
}

function usePoseData(posedata){
    if (!model.skeleton) {
        model.traverse((child) => {
            if (!model.skeleton && child.skeleton) {
                model.skeleton = child.skeleton;
            }
        });
    }
    bvhloader.load(posedata, async function ( result ) {
            bvhSkeletonHelper = new THREE.SkeletonHelper(  result.skeleton.bones[ 0 ]  );
            bvhSkeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to THREE.SkeletonHelper directly
        
            //var boneContainer = new THREE.Group();
            // boneContainer.add( result.skeleton.bones[ 0 ] );
            // boneContainer.position.z = - 100;
            // boneContainer.position.y = - 100;
            //scene.add( result.skeleton.bones[ 0 ] );
            //scene.add( bvhSkeletonHelper );
            //scene.add( boneContainer );
            
            // get offsets when it is in T-Pose
            options.fps = 1 / result.clip.tracks[0].times[1];
            //options.offsets = THREE.SkeletonUtils.getSkeletonOffsets( model, bvhSkeletonHelper, options );
            
            let newClip = THREE.SkeletonUtils.retargetClip(model, bvhSkeletonHelper, result.clip, h36moptionsmixamo1);
           
            // play animation
            bvhMixer = new THREE.AnimationMixer( model );
            //bvhMixer.clipAction( result.clip ).setEffectiveWeight( 1.0 ).play();
            //THREE.SkeletonUtils.retarget( model, bvhSkeletonHelper, options );
            bvhaction = bvhMixer.clipAction(newClip).setEffectiveWeight( 1.0 ).play();
            // let action =  bvhMixer.clipAction(newClip);
            // action.play();
        }
         );
         //animate();
}
animate();

var app = new Vue({
    el: "#controller",
    data: {
        target: "face",
    },
});

function changeTarget(target) {
    app.target = target;
    if (target == "face") {
        positionOffset = { x: 0, y: 1, z: 0 };
    } else if (target == "half") {
        positionOffset = {
            x: 0,
            y: 1.1,
            z: 1,
        };
    } else if (target == "full") {
        positionOffset = {
            x: 0,
            y: 1.4,
            z: 2,
        };
    }


// keyborad control camera position
document.addEventListener("keydown", (event) => {
    var step = 0.1;
    switch (event.key) {
        case "d":
        case "ArrowRight":
            positionOffset.x -= step;
            break;
        case "a":
        case "ArrowLeft":
            positionOffset.x += step;
            break;
        case "w":
        case "ArrowUp":
            positionOffset.y += step;
            break;
        case "s":
        case "ArrowDown":
            positionOffset.y -= step;
            break;
        case "r":
            if (isRecordingStarted) {
                stopRecording();
                document.getElementById("recording").style.display = "none";
            } else {
                startRecording();
                document.getElementById("recording").style.display = "";
            }
    }
});

var contentDom = document.querySelector("#model");

//阻止相关事件默认行为
contentDom.ondragcenter =
    contentDom.ondragover =
    contentDom.ondragleave =
        () => {
            return false;
        };

//对拖动释放事件进行处理
contentDom.ondrop = (e) => {
    //console.log(e);
    var filePath = e.dataTransfer.files[0].path.replaceAll("\\", "/");
    console.log(filePath);
    contentDom.style.backgroundImage = `url(${filePath})`;
    contentDom.style.backgroundSize = "cover";
    contentDom.style.backgroundPosition = "center";
    contentDom.style.backgroundRepeat = "no-repeat";
};

var elementToRecord = contentDom;
var canvas2d = document.getElementById("background-canvas");
var context = canvas2d.getContext("2d");

canvas2d.width = elementToRecord.clientWidth;
canvas2d.height = elementToRecord.clientHeight;

var recorder = new RecordRTC(canvas2d, {
    type: "canvas",
});

function startRecording() {
    this.disabled = true;

    isRecordingStarted = true;

    recorder.startRecording();
}

function stopRecording() {
    this.disabled = true;

    recorder.stopRecording(function () {
        isRecordingStarted = false;

        var blob = recorder.getBlob();

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "video.webm";

        link.dispatchEvent(
            new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window,
            })
        );

        setTimeout(() => {
            window.URL.revokeObjectURL(blob);
            link.remove();
        }, 100);
    });
}
}