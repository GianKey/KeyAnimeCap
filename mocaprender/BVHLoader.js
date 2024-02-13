

/**
 * Description: reads BVH files and outputs a single THREE.Skeleton and an THREE.AnimationClip
 *
 * Currently only supports bvh files contai/ning a single root.
 *
 */

// var SkeletonUtils
// var BVHLoader
// async function loadThreeES6Module() {
//     try {
//         // 使用 import() 函数加载 ES6 模块
//          SkeletonUtils = await import("../node_modules/three/examples/jsm/utils/SkeletonUtils.js");
//          BVHLoader = await import("../node_modules/three/examples/jsm/loaders/BVHLoader.js");
//     } catch (error) {   
//         console.error("Failed to load ES6 module:", error);
//     }
// }

// import {SkeletonUtils} from "../node_modules/three/examples/jsm/utils/SkeletonUtils.js";
// import { BVHLoader}  from "../node_modules/three/examples/jsm/loaders/BVHLoader.js";
// loadThreeES6Module();

var options;

options = {
    hip: "hip",
    // left is SEA3D bone names and right BVH bone names
    names: {
        "mixamorig:Hips" : "hips",
        "mixamorig:Spine" : "spine",
        "mixamorig:Spine1" : "spine-1",
        "mixamorig:Spine2" : "chest",
        "mixamorig:Neck" : "neck",
        "mixamorig:Head" : "head",

        "mixamorig:LeftShoulder" : "shoulder.L",
        "mixamorig:LeftArm" : "upper_arm.L",
        "mixamorig:LeftForeArm" : "forearm.L",
        "mixamorig:LeftHand" : "hand.L",

        "mixamorig:LeftHandThumb1" : "f_thumb.01.L",
        "mixamorig:LeftHandThumb2" : "f_thumb.02.L",
        "mixamorig:LeftHandThumb3" : "f_thumb.03.L",

        "mixamorig:LeftHandIndex1" : "f_index.01.L",
        "mixamorig:LeftHandIndex2" : "f_index.02.L",
        "mixamorig:LeftHandIndex3" : "f_index.03.L",

        "mixamorig:LeftHandMiddle1" : "f_middle.01.L",
        "mixamorig:LeftHandMiddle2" : "f_middle.02.L",
        "mixamorig:LeftHandMiddle3" : "f_middle.03.L",

        "mixamorig:LeftHandRing1" : "f_ring.01.L",
        "mixamorig:LeftHandRing2" : "f_ring.02.L",
        "mixamorig:LeftHandRing3" : "f_ring.03.L",

        "mixamorig:LeftHandPinky1" : "f_pinky.01.L",
        "mixamorig:LeftHandPinky2" : "f_pinky.02.L",
        "mixamorig:LeftHandPinky3" : "f_pinky.03.L",

        "mixamorig:RightShoulder" : "shoulder.R",
        "mixamorig:RightArm" : "upper_arm.R",
        "mixamorig:RightForeArm" : "forearm.R",
        "mixamorig:RightHand" : "hand.R",

        "mixamorig:RightHandThumb1" : "f_thumb.01.R",
        "mixamorig:RightHandThumb2" : "f_thumb.02.R",
        "mixamorig:RightHandThumb3" : "f_thumb.03.R",

        "mixamorig:RightHandIndex1" : "f_index.01.R",
        "mixamorig:RightHandIndex2" : "f_index.02.R",
        "mixamorig:RightHandIndex3" : "f_index.03.R",

        "mixamorig:RightHandMiddle1" : "f_middle.01.R",
        "mixamorig:RightHandMiddle2" : "f_middle.02.R",
        "mixamorig:RightHandMiddle3" : "f_middle.03.R",

        "mixamorig:RightHandRing1" : "f_ring.01.R",
        "mixamorig:RightHandRing2" : "f_ring.02.R",
        "mixamorig:RightHandRing3" : "f_ring.03.R",

        "mixamorig:RightHandPinky1" : "f_pinky.01.R",
        "mixamorig:RightHandPinky2" : "f_pinky.02.R",
        "mixamorig:RightHandPinky3" : "f_pinky.03.R",

        "mixamorig:LeftUpLeg" : "thigh.L",
        "mixamorig:LeftLeg" : "shin.L",
        "mixamorig:LeftFoot" : "foot.L",
        "mixamorig:LeftToeBase" : "toe.L",

        "mixamorig:RightUpLeg" : "thigh.R",
        "mixamorig:RightLeg" : "shin.R",
        "mixamorig:RightFoot" : "foot.R",
        "mixamorig:RightToeBase" : "toe.R"
    }
};

function bvhloadres ( result ,play) {

    bvhSkeletonHelper = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );
    bvhSkeletonHelper.skeleton = result.skeleton; // allow animation mixer to bind to THREE.SkeletonHelper directly

    var boneContainer = new THREE.Group();
    boneContainer.add( result.skeleton.bones[ 0 ] );
    boneContainer.position.z = - 100;
    boneContainer.position.y = - 100;

    scene.add( bvhSkeletonHelper );
    scene.add( boneContainer );

    // get offsets when it is in T-Pose
    options.offsets = THREE.SkeletonUtils.getSkeletonOffsets( player, bvhSkeletonHelper, options );

    // play animation
    bvhMixer = new THREE.AnimationMixer( bvhSkeletonHelper );
    bvhMixer.clipAction( result.clip ).setEffectiveWeight( 1.0 ).play();

}

// export { BVHLoader };

//module.exports.BVHLoader= BVHLoader
module.exports.bvhloadres=bvhloadres


// class BVHLoader extends THREE.Loader {

// 	constructor( manager ) {

// 		super( manager );

// 		this.animateBonePositions = true;
// 		this.animateBoneRotations = true;

// 	}

// 	load( url, onLoad, onProgress, onError ) {

// 		const scope = this;

// 		const loader = new THREE.FileLoader( scope.manager );
// 		loader.setPath( scope.path );
// 		loader.setRequestHeader( scope.requestHeader );
// 		loader.setWithCredentials( scope.withCredentials );
// 		loader.load( url, function ( text ) {

// 			try {

// 				onLoad( scope.parse( text ) );

// 			} catch ( e ) {

// 				if ( onError ) {

// 					onError( e );

// 				} else {

// 					console.error( e );

// 				}

// 				scope.manager.itemError( url );

// 			}

// 		}, onProgress, onError );

// 	}

// 	parse( text ) {

// 		/*
// 			reads a string array (lines) from a BVH file
// 			and outputs a skeleton structure including motion data

// 			returns thee root node:
// 			{ name: '', channels: [], children: [] }
// 		*/
// 		function readBvh( lines ) {

// 			// read model structure

// 			if ( nextLine( lines ) !== 'HIERARCHY' ) {

// 				console.error( 'THREE.BVHLoader: HIERARCHY expected.' );

// 			}

// 			const list = []; // collects flat array of all bones
// 			const root = readNode( lines, nextLine( lines ), list );

// 			// read motion data

// 			if ( nextLine( lines ) !== 'MOTION' ) {

// 				console.error( 'THREE.BVHLoader: MOTION expected.' );

// 			}

// 			// number of frames

// 			let tokens = nextLine( lines ).split( /[\s]+/ );
// 			const numFrames = parseInt( tokens[ 1 ] );

// 			if ( isNaN( numFrames ) ) {

// 				console.error( 'THREE.BVHLoader: Failed to read number of frames.' );

// 			}

// 			// frame time

// 			tokens = nextLine( lines ).split( /[\s]+/ );
// 			const frameTime = parseFloat( tokens[ 2 ] );

// 			if ( isNaN( frameTime ) ) {

// 				console.error( 'THREE.BVHLoader: Failed to read frame time.' );

// 			}

// 			// read frame data line by line

// 			for ( let i = 0; i < numFrames; i ++ ) {

// 				tokens = nextLine( lines ).split( /[\s]+/ );
// 				readFrameData( tokens, i * frameTime, root );

// 			}

// 			return list;

// 		}

// 		/*
// 			Recursively reads data from a single frame into the bone hierarchy.
// 			The passed bone hierarchy has to be structured in the same order as the BVH file.
// 			keyframe data is stored in bone.frames.

// 			- data: splitted string array (frame values), values are shift()ed so
// 			this should be empty after parsing the whole hierarchy.
// 			- frameTime: playback time for this keyframe.
// 			- bone: the bone to read frame data from.
// 		*/
// 		function readFrameData( data, frameTime, bone ) {

// 			// end sites have no motion data

// 			if ( bone.type === 'ENDSITE' ) return;

// 			// add keyframe

// 			const keyframe = {
// 				time: frameTime,
// 				position: new THREE.Vector3(),
// 				rotation: new THREE.Quaternion()
// 			};

// 			bone.frames.push( keyframe );

// 			const quat = new THREE.Quaternion();

// 			const vx = new THREE.Vector3( 1, 0, 0 );
// 			const vy = new THREE.Vector3( 0, 1, 0 );
// 			const vz = new THREE.Vector3( 0, 0, 1 );

// 			// parse values for each channel in node

// 			for ( let i = 0; i < bone.channels.length; i ++ ) {

// 				switch ( bone.channels[ i ] ) {

// 					case 'Xposition':
// 						keyframe.position.x = parseFloat( data.shift().trim() );
// 						break;
// 					case 'Yposition':
// 						keyframe.position.y = parseFloat( data.shift().trim() );
// 						break;
// 					case 'Zposition':
// 						keyframe.position.z = parseFloat( data.shift().trim() );
// 						break;
// 					case 'Xrotation':
// 						quat.setFromAxisAngle( vx, parseFloat( data.shift().trim() ) * Math.PI / 180 );
// 						keyframe.rotation.multiply( quat );
// 						break;
// 					case 'Yrotation':
// 						quat.setFromAxisAngle( vy, parseFloat( data.shift().trim() ) * Math.PI / 180 );
// 						keyframe.rotation.multiply( quat );
// 						break;
// 					case 'Zrotation':
// 						quat.setFromAxisAngle( vz, parseFloat( data.shift().trim() ) * Math.PI / 180 );
// 						keyframe.rotation.multiply( quat );
// 						break;
// 					default:
// 						console.warn( 'THREE.BVHLoader: Invalid channel type.' );

// 				}

// 			}

// 			// parse child nodes

// 			for ( let i = 0; i < bone.children.length; i ++ ) {

// 				readFrameData( data, frameTime, bone.children[ i ] );

// 			}

// 		}

// 		/*
// 		 Recursively parses the HIERACHY section of the BVH file

// 		 - lines: all lines of the file. lines are consumed as we go along.
// 		 - firstline: line containing the node type and name e.g. 'JOINT hip'
// 		 - list: collects a flat list of nodes

// 		 returns: a BVH node including children
// 		*/
// 		function readNode( lines, firstline, list ) {

// 			const node = { name: '', type: '', frames: [] };
// 			list.push( node );

// 			// parse node type and name

// 			let tokens = firstline.split( /[\s]+/ );

// 			if ( tokens[ 0 ].toUpperCase() === 'END' && tokens[ 1 ].toUpperCase() === 'SITE' ) {

// 				node.type = 'ENDSITE';
// 				node.name = 'ENDSITE'; // bvh end sites have no name

// 			} else {

// 				node.name = tokens[ 1 ];
// 				node.type = tokens[ 0 ].toUpperCase();

// 			}

// 			if ( nextLine( lines ) !== '{' ) {

// 				console.error( 'THREE.BVHLoader: Expected opening { after type & name' );

// 			}

// 			// parse OFFSET

// 			tokens = nextLine( lines ).split( /[\s]+/ );

// 			if ( tokens[ 0 ] !== 'OFFSET' ) {

// 				console.error( 'THREE.BVHLoader: Expected OFFSET but got: ' + tokens[ 0 ] );

// 			}

// 			if ( tokens.length !== 4 ) {

// 				console.error( 'THREE.BVHLoader: Invalid number of values for OFFSET.' );

// 			}

// 			const offset = new THREE.Vector3(
// 				parseFloat( tokens[ 1 ] ),
// 				parseFloat( tokens[ 2 ] ),
// 				parseFloat( tokens[ 3 ] )
// 			);

// 			if ( isNaN( offset.x ) || isNaN( offset.y ) || isNaN( offset.z ) ) {

// 				console.error( 'THREE.BVHLoader: Invalid values of OFFSET.' );

// 			}

// 			node.offset = offset;

// 			// parse CHANNELS definitions

// 			if ( node.type !== 'ENDSITE' ) {

// 				tokens = nextLine( lines ).split( /[\s]+/ );

// 				if ( tokens[ 0 ] !== 'CHANNELS' ) {

// 					console.error( 'THREE.BVHLoader: Expected CHANNELS definition.' );

// 				}

// 				const numChannels = parseInt( tokens[ 1 ] );
// 				node.channels = tokens.splice( 2, numChannels );
// 				node.children = [];

// 			}

// 			// read children

// 			while ( true ) {

// 				const line = nextLine( lines );

// 				if ( line === '}' ) {

// 					return node;

// 				} else {

// 					node.children.push( readNode( lines, line, list ) );

// 				}

// 			}

// 		}

// 		/*
// 			recursively converts the internal bvh node structure to a THREE.Bone hierarchy

// 			source: the bvh root node
// 			list: pass an empty array, collects a flat list of all converted THREE.Bones

// 			returns the root THREE.Bone
// 		*/
// 		function toTHREEBone( source, list ) {

// 			const bone = new THREE.Bone();
// 			list.push( bone );

// 			bone.position.add( source.offset );
// 			bone.name = source.name;

// 			if ( source.type !== 'ENDSITE' ) {

// 				for ( let i = 0; i < source.children.length; i ++ ) {

// 					bone.add( toTHREEBone( source.children[ i ], list ) );

// 				}

// 			}

// 			return bone;

// 		}

// 		/*
// 			builds a THREE.AnimationClip from the keyframe data saved in each bone.

// 			bone: bvh root node

// 			returns: a THREE.AnimationClip containing position and quaternion tracks
// 		*/
// 		function toTHREEAnimation( bones ) {

// 			const tracks = [];

// 			// create a position and quaternion animation track for each node

// 			for ( let i = 0; i < bones.length; i ++ ) {

// 				const bone = bones[ i ];

// 				if ( bone.type === 'ENDSITE' )
// 					continue;

// 				// track data

// 				const times = [];
// 				const positions = [];
// 				const rotations = [];

// 				for ( let j = 0; j < bone.frames.length; j ++ ) {

// 					const frame = bone.frames[ j ];

// 					times.push( frame.time );

// 					// the animation system animates the position property,
// 					// so we have to add the joint offset to all values

// 					positions.push( frame.position.x + bone.offset.x );
// 					positions.push( frame.position.y + bone.offset.y );
// 					positions.push( frame.position.z + bone.offset.z );

// 					rotations.push( frame.rotation.x );
// 					rotations.push( frame.rotation.y );
// 					rotations.push( frame.rotation.z );
// 					rotations.push( frame.rotation.w );

// 				}

// 				if ( scope.animateBonePositions ) {

// 					tracks.push( new THREE.VectorKeyframeTrack( bone.name + '.position', times, positions ) );

// 				}

// 				if ( scope.animateBoneRotations ) {

// 					tracks.push( new THREE.QuaternionKeyframeTrack( bone.name + '.quaternion', times, rotations ) );

// 				}

// 			}

// 			return new THREE.AnimationClip( 'animation', - 1, tracks );

// 		}

// 		/*
// 			returns the next non-empty line in lines
// 		*/
// 		function nextLine( lines ) {

// 			let line;
// 			// skip empty lines
// 			while ( ( line = lines.shift().trim() ).length === 0 ) { }

// 			return line;

// 		}

// 		const scope = this;

// 		const lines = text.split( /[\r\n]+/g );

// 		const bones = readBvh( lines );

// 		const threeBones = [];
// 		toTHREEBone( bones[ 0 ], threeBones );

// 		const threeClip = toTHREEAnimation( bones );

// 		return {
// 			skeleton: new THREE.Skeleton( threeBones ),
// 			clip: threeClip
// 		};

// 	}

// }
