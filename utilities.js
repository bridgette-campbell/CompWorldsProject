function calculateNearestAngle(x1, y1, x2, y2, incrementAmount) {
        var dx = x1 - x2;
        var dy = y1 - y2;

        var radiansAngle = Math.atan2(dy, dx) * -1;
        if (radiansAngle < 0) {
            radiansAngle += 2 * Math.PI;
        }

        var degreesAngle = radiansToDegrees(radiansAngle);

        return nearestAngle(degreesAngle, incrementAmount);
}

/*
 * Returns the angle (in degrees) closest to theDegrees
 * that is a multiple of incrementAmount.
 * For example, nearestAngle(46.2, 22.5) would return 45. 
 */
function nearestAngle(theDegrees, incrementAmount) {
    // Start at 0
    var nearestDegree = 0;

    // Continuously increment by incrementAmount until degrees is passed or met
    while (nearestDegree < theDegrees) {
        nearestDegree += incrementAmount;
    }
    
    // Calculate which is closer, the current nearestDegree or the prior one
    var currentDistance = Math.abs(theDegrees - nearestDegree);
    var priorDistance = Math.abs(theDegrees - (nearestDegree - incrementAmount));

    // If prior nearestDegree was closer to degrees, decrement by incrementAmount
    if (priorDistance < currentDistance) {
        nearestDegree -= incrementAmount;
    }
    
    if (nearestDegree == 360) {
        return 0;
    } else {
        return nearestDegree;   
    }
}

/*
 * Converts radians to degrees.
 * For example, radiansToDegrees(0) returns 0, radiansToDegrees(Math.pi) returns 180.
 */
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

/*
 * Converts degrees to radians.
 * For example, degreesToRadians(0) returns 0, degreesToRadians(180) returns Math.pi.
 */
function degreesToRadians(degrees) {
    return (180 / Math.PI) / degrees;
}