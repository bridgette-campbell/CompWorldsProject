function ScourgeAI(entity, viewDistance, attackDistance, attacksPerSecond, movementSpeed) {
    AI.call(this, entity);

    //Constructor fields
    this.viewDistance = viewDistance;

    this.attackDistance = attackDistance;

    this.attacksPerSecond = attacksPerSecond;

    this.movementSpeed = movementSpeed;

    //Other instance fields.
    this.timeSinceLastAttack = 0;
    this.timeSinceLastMoved = 0;
    this.timeExist = 0;
    this.attackCount = 0;

    this.sinMult = randomBetweenTwoNumbers(1, 3);
}

ScourgeAI.prototype = new AI();
ScourgeAI.prototype.constructor = BasicEnemyAI;

ScourgeAI.prototype.update = function () {
    var delta = this.entity.game.clockTick;

    this.timeSinceLastAttack += delta;
    this.timeSinceLastMoved += delta;

    //Getting target location
    var target = this.entity.game.player;
    var tX = PhysicalEntity.getMiddleXOf(target);
    var tY = PhysicalEntity.getMiddleYOf(target);

    //Distance between target and self.
    var sX = PhysicalEntity.getMiddleXOf(this.entity);
    var sY = PhysicalEntity.getMiddleYOf(this.entity);

    var distance = Math.sqrt(Math.pow((tX - sX), 2) + Math.pow((tY - sY), 2));

    if (distance < SCO_ATTACK_DISTANCE) {
        this.isExplode = true;
    }

    if (this.isExplode) {
        this.attack(delta);
    } else {

        if (distance < this.viewDistance) {
            if (distance > this.attackDistance - 5) {
                this.timeSinceLastMoved = 0;
                this.moveTowards(tX, tY);
            } else {
                if (this.timeSinceLastMoved > .5) {
                    this.attack(delta);
                }
            }
        } else {
            this.entity.physics.velocity = 0;
            this.entity.animation.currentAction = "standing";
        }
    }

    Entity.prototype.update.call(this);
    this.entity.lastUpdated = this.entity.game.gameTime;
}


ScourgeAI.prototype.moveTowards = function (tX, tY) {
    var delta = this.entity.game.clockTick;

    //This is super rudimentary. If we add obstacles, we will need to make a more complex algorithm.

    var physics = this.entity.physics;
    var srcX = PhysicalEntity.getMiddleXOf(this.entity);
    var srcY = PhysicalEntity.getMiddleYOf(this.entity);


    this.timeExist += delta;
    var angle = calculateAngleRadians(tX, tY, srcX, srcY) + Math.sin(this.sinMult * this.timeExist) / 2;

    //10 degrees in radians. Fairly fast. This is a magic number and should be standardized.
    var interpSpeed = 10 * Math.PI / 180;

    var tolerance = 10 * Math.PI / 180;

    if (interpolate(this.entity, angle, interpSpeed, tolerance)) {
        physics.velocity = this.movementSpeed;
    }
    //Idk, maybe this should be inside the interp check.
    this.entity.animation.currentAction = "walking";
}

ScourgeAI.prototype.attack = function (delta) {
    //This will be done outside the loop so the enemy appears to
    //"track" the player even when the enemy isn't shooting.

    var physics = this.entity.physics;

    physics.velocity = 0;

    var attackAnimationTime = .35;//Magic numbers, YAY!
    if (this.timeSinceLastAttack > attackAnimationTime) {
        this.entity.animation.currentAction = "standing";
    }

    var target = this.entity.game.player;

    var srcX = physics.x + ((physics.width * physics.scale) / 2);
    var srcY = physics.y + ((physics.height * physics.scale) / 2);
    var dstX = target.physics.x + ((target.physics.width / 2) * SCALE);
    var dstY = target.physics.y + ((target.physics.height / 2) * SCALE);

    var angle = calculateAngleRadians(dstX, dstY, srcX, srcY);

    var interpSpeed = 10 * Math.PI / 180;
    var tolerance = 10 * Math.PI / 180;
    interpolate(this.entity, angle, interpSpeed, tolerance);

    var distance = Math.sqrt(Math.pow((srcX - dstX), 2) + Math.pow((srcY - dstY), 2));


    if (this.timeSinceLastAttack >= (1 / this.attacksPerSecond)) {
		this.entity.animation.elapsedTime = 0;
        this.entity.animation.currentAction = "attacking";

        // Create a bullet(s)

        var angleCount = 32;
        for (var i = 0; i < angleCount; i++){
            var that = this;
            (() => {
                var aimAngle = 2 * Math.PI - ((2 * Math.PI / angleCount) * i);

                var bulletBehavior = function (bullet) {
                    Bullet.oscillate(bullet, aimAngle, distance);
                }

                var bullet = new Bullet(that.entity.game,
                    bulAsset = that.entity.game.assetManager.getAsset("./img/oscillate_bullet.png"),
                    that.entity, false, bulletBehavior);
                bullet.init(that.entity.game);

                that.entity.game.addBullet(bullet);

            })();
        }
        // Reset timeSinceLastShot
        this.timeSinceLastAttack = 0;
        this.attackCount++;
        if (this.attackCount >= SCO_ATTACK_COUNT) {
            this.entity.stats.hp = 0;
        }
    }

/*
    if (this.timeSinceLastAttack >= (1 / this.attacksPerSecond)) {
        var angleCount = 16;
        for (var i = 0; i < angleCount; i++) {
            var that = this;
            
        }
    }*/
}
