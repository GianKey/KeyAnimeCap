function bvhToSEA3D( result ) {

    var options = {
        useFirstFramePosition: true,
        preserveHipPosition: false,
        hip: "hip",
        // left is SEA3D bone names and right BVH bone names
        names: {
            "Root": "hip",
            "Base HumanSpine3": "abdomen",
            "Base HumanRibcage": "chest",
            "Base HumanHead": "head",

            "Base HumanRUpperarm": "rShldr",
            "Base HumanRForearm1": "rForeArm",
            "Base HumanRPalm": "rHand",

            "Base HumanLUpperarm": "lShldr",
            "Base HumanLForearm1": "lForeArm",
            "Base HumanLPalm": "lHand",

            "Base HumanRThigh": "rThigh",
            "Base HumanRCalf1": "rShin",
            "Base HumanRFoot": "rFoot",

            "Base HumanLThigh": "lThigh",
            "Base HumanLCalf1": "lShin",
            "Base HumanLFoot": "lFoot"
        },

    };

    // Automatic offset: get offsets when it is in T-Pose
    options.offsets = SkeletonUtils.getSkeletonOffsets( player, bvhSkeletonHelper, options );

    /*
    // Manual offsets: compensates the difference in skeletons ( T-Pose )
    options.offsets = {
        "lShldr": new Matrix4().makeRotationFromEuler(
            new Euler(
                0,
                Math.degToRad( - 45 ),
                Math.degToRad( - 80 )
            )
        ),
        "rShldr": new Matrix4().makeRotationFromEuler(
            new Euler(
                0,
                Math.degToRad( 45 ),
                Math.degToRad( 80 )
            )
        ),
        "lFoot": new Matrix4().makeRotationFromEuler(
            new Euler(
                0,
                Math.degToRad( 15 ),
                0
            )
        ),
        "rFoot": new Matrix4().makeRotationFromEuler(
            new Euler(
                0,
                Math.degToRad( 15 ),
                0
            )
        )
    };
    */

    var clip = SkeletonUtils.retargetClip( player, result.skeleton, result.clip, options );

    clip.name = "dance";

    clip = SEA3D.AnimationClip.fromClip( clip );

    player.addAnimation( new SEA3D.Animation( clip ) );

    player.play( "dance" );


}