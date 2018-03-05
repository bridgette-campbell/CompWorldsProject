
/**
 * Game levels will be run and determine the state of the game.
 * @param {*} game - The game.
 * @param {*} initFunc - The initialization for the level. Args: (gameLevel, game)
 * @param {*} sequenceFunc - The things things that happen in this level. Args: (gameLevel, game)
 * @param {*} completeCondition - Under what conditions is this level complete? Args: (gameLevel, game)
 * @param {*} onCompletion - What should be done upon completion of the level? Args: (gameLevel, game)
 */
function GameLevel(game, initFunc, sequenceFunc, completeCondition, onCompletion) {
    this.game = game;
    this.initFunc = initFunc;
    this.sequenceFunc = sequenceFunc;
    this.completeCondition = completeCondition;
    this.onCompletion = onCompletion;
    this.initialized = false;
    this.phasesDone = [];
    this.spawnSequences = [];
    //this.physics = new Physics(this, 0, 0, width, height, 1.0, true);
    this.physics = {x: 0, y: 0};

    this.timeSinceCompleted = 0;

    this.hitshapes = [];
}

GameLevel.prototype = Object.create(Entity.prototype);
GameLevel.prototype.constructor = GameLevel;

GameLevel.prototype.update = function () {
    var level = this;

    level.hitshapes.forEach(function (shape) {
        shape.update();
    });

    this.sequenceFunc(this, this.game);

    if (this.completeCondition(this, this.game)) {
        this.onCompletion(this, this.game);
    }
}

GameLevel.prototype.init = function () {
    this.initFunc(this, this.game);
    this.initialized = true;
}

/**
 * Game Level Static Functions
 */

//Standard complete condition
GameLevel.stdCompleteCondition = function (gameLevel, gameEngine) {
    return gameEngine.enemies.length == 0 && gameLevel.initialized;//This might be buggy. Not sure yet.
}

//Standard onCompletion
GameLevel.stdOnCompletion = function (gameLevel, gameEngine) {
	//stop the level's audio
	var id = "terran" + gameEngine.currentLevel;
	var audio = document.getElementById(id);
	audio.pause();
	
    //Here is where the outro animation should happen.
    if (gameEngine.currentLevel < gameEngine.levels.length - 1) {//-1 magic number because javascript
        gameEngine.bullets = [];
        if(this.timeSinceCompleted > 1){
            gameEngine.currentLevel++;
            gameEngine.levels[gameEngine.currentLevel].init();
        }
        
        var delta = gameEngine.clockTick;
        this.timeSinceCompleted += delta;
    } else if (gameEngine.player.stats.hp > 0) {
        gameEngine.won = true;
    } else {
		//gameEngine.dead = true;
	}
}
//Standard level sequence
GameLevel.stdLevelSequence = function (gameLevel, gameEngine) {
    gameLevel.spawnSequences.forEach(spawnSequence => {
        spawnSequence.resolve();
    });
}

//Level one init
GameLevel.levelOneInit = function (gameLevel, gameEngine) {
    var map = new Map(gameEngine, AM.getAsset("./img/map_jungle.png"), 1600, 1600);
    gameEngine.map = map;
    this.hitshapes.push(new Box(JUNGLE_WALL_W_HITBOX_X, JUNGLE_WALL_W_HITBOX_Y, JUNGLE_WALL_W_HITBOX_W, JUNGLE_WALL_W_HITBOX_H, this));
    this.hitshapes.push(new Box(JUNGLE_WALL_N_HITBOX_X, JUNGLE_WALL_N_HITBOX_Y, JUNGLE_WALL_N_HITBOX_W, JUNGLE_WALL_N_HITBOX_H, this));
    this.hitshapes.push(new Box(JUNGLE_WALL_E_HITBOX_X, JUNGLE_WALL_E_HITBOX_Y, JUNGLE_WALL_E_HITBOX_W, JUNGLE_WALL_E_HITBOX_H, this));
    this.hitshapes.push(new Box(JUNGLE_WALL_S_HITBOX_X, JUNGLE_WALL_S_HITBOX_Y, JUNGLE_WALL_S_HITBOX_W, JUNGLE_WALL_S_HITBOX_H, this));
	//start the level's audio
	var audio = document.getElementById("terran1");
	audio.play();

    var zerglingCount = 0;
    var zerglings = new SpawnSequence(1, 
        () => { return true },
        () => {
            for (var i = 0; i < ZERGLINGS; i++) {
                var x = calcSpawnX(gameEngine, ZER_FRAME_DIM);
                var y = calcSpawnY(gameEngine, ZER_FRAME_DIM);
                var zergling = Zergling.quickCreate(gameEngine, x, y);
                zergling.onDeathCallbacks.push(() => { zerglingCount-- });
                gameEngine.addEnemy(zergling);
                zerglingCount++;
            }
        });
    gameLevel.spawnSequences.push(zerglings);

    var hydraliskCount = 0;
    var hydralisks = new SpawnSequence(1, 
        () => { return true },
        () => {
            for (var i = 0; i < HYDRALISKS; i++) {
                var x = calcSpawnX(gameEngine, HYD_FRAME_DIM);
                var y = calcSpawnY(gameEngine, HYD_FRAME_DIM);
                var hydralisk = Hydralisk.quickCreate(gameEngine, x, y);
                hydralisk.onDeathCallbacks.push(() => {hydraliskCount-- });
                gameEngine.addEnemy(hydralisk);
                hydraliskCount++;
            }
        });
    gameLevel.spawnSequences.push(hydralisks);

    var infestedTerrans = new SpawnSequence(1, 
        () => { return true },
        () => {
            for (var i = 0; i < TERRANS; i++) {
                var x = calcSpawnX(gameEngine, HYD_FRAME_DIM);
                var y = calcSpawnY(gameEngine, HYD_FRAME_DIM);
                var terran = new InfestedTerran(x, y, gameEngine, AM.getAsset("./img/red_infested_terran.png"), AM.getAsset("./img/red_infested_terran.png"));
                terran.init(gameEngine);
                gameEngine.addEnemy(terran);
            }
        });
    gameLevel.spawnSequences.push(infestedTerrans);

    var boss = new SpawnSequence(1, 
        () => { return hydraliskCount == 0 && zerglingCount == 0 },
        () => {
            var x = calcSpawnX(gameEngine, DEF_FRAME_DIM);
            var y = calcSpawnY(gameEngine, DEF_FRAME_DIM);
            var defiler = new Defiler(x, y, gameEngine, AM.getAsset("./img/red_defiler.png"), AM.getAsset("./img/red_defiler.png"));
            defiler.init(gameEngine);
            gameEngine.addEnemy(defiler);
        });
    gameLevel.spawnSequences.push(boss);
    
}

//Level two init
GameLevel.levelTwoInit = function (gameLevel, gameEngine) {
    var map = new Map(gameEngine, AM.getAsset("./img/map_dessert.png"), 1600, 1600);
    gameEngine.map = map;
    this.hitshapes.push(new Box(DESERT_WALL_W_HITBOX_X, DESERT_WALL_W_HITBOX_Y, DESERT_WALL_W_HITBOX_W, DESERT_WALL_W_HITBOX_H, this));
    this.hitshapes.push(new Box(DESERT_WALL_N_HITBOX_X, DESERT_WALL_N_HITBOX_Y, DESERT_WALL_N_HITBOX_W, DESERT_WALL_N_HITBOX_H, this));
    this.hitshapes.push(new Box(DESERT_WALL_E_HITBOX_X, DESERT_WALL_E_HITBOX_Y, DESERT_WALL_E_HITBOX_W, DESERT_WALL_E_HITBOX_H, this));
    this.hitshapes.push(new Box(DESERT_WALL_S_HITBOX_X, DESERT_WALL_S_HITBOX_Y, DESERT_WALL_S_HITBOX_W, DESERT_WALL_S_HITBOX_H, this));
	//start the level's audio
	var audio = document.getElementById("terran2");
	audio.play();

    var ultraliskCount = 0;
    var ultralisks = new SpawnSequence(1, 
        () => { return true },
        () => {
            for (var i = 0; i < ULTRALISKS; i++) {
                var x = calcSpawnX(gameEngine, ULT_FRAME_DIM);
                var y = calcSpawnY(gameEngine, ULT_FRAME_DIM);
                var ultralisk = new Ultralisk(x, y, gameEngine, AM.getAsset("./img/red_ultralisk.png"), AM.getAsset("./img/red_ultralisk.png"));
                ultralisk.onDeathCallbacks.push(()=>{ultraliskCount--});
                ultralisk.init(gameEngine);
                gameEngine.addEnemy(ultralisk);
                ultraliskCount++;
            }
        });
    gameLevel.spawnSequences.push(ultralisks);

    var mutaliskCount = 0;
    var mutalisks = new SpawnSequence(1, 
        () => { return true },
        () => {
            for (var i = 0; i < MUTALISKS; i++) {
                var x = calcSpawnX(gameEngine, MUT_FRAME_DIM);
                var y = calcSpawnY(gameEngine, MUT_FRAME_DIM);
                var mutalisk = new Mutalisk(x, y, gameEngine, AM.getAsset("./img/red_mutalisk.png"), AM.getAsset("./img/mut_zairdthl.png"));
                mutalisk.onDeathCallbacks.push(()=>{mutaliskCount--});
                mutalisk.init(gameEngine);
                gameEngine.addEnemy(mutalisk);
                mutaliskCount++;
            }
        });

    gameLevel.spawnSequences.push(mutalisks);
	
    var boss = new SpawnSequence(1, 
        () => { return ultraliskCount == 0 && mutaliskCount == 0 },
        () => {
            var x = calcSpawnX(gameEngine, DEV_FRAME_DIM);
            var y = calcSpawnY(gameEngine, DEV_FRAME_DIM);
            var devourer = new Devourer(x, y, gameEngine, AM.getAsset("./img/red_devourer.png"), AM.getAsset("./img/dev_zairdthl.png"));
            devourer.init(gameEngine);
            gameEngine.addEnemy(devourer);
            //gameLevel.spawnSequences.splice(this, 1);
        });
    gameLevel.spawnSequences.push(boss);
}

//Level three init
GameLevel.levelThreeInit = function (gameLevel, gameEngine) {
    var map = new Map(gameEngine, AM.getAsset("./img/map_ash.png"), 1600, 1600);
    gameEngine.map = map;
    this.hitshapes.push(new Box(ASH_WALL_W_HITBOX_X, ASH_WALL_W_HITBOX_Y, ASH_WALL_W_HITBOX_W, ASH_WALL_W_HITBOX_H, this));
    this.hitshapes.push(new Box(ASH_WALL_N_HITBOX_X, ASH_WALL_N_HITBOX_Y, ASH_WALL_N_HITBOX_W, ASH_WALL_N_HITBOX_H, this));
    this.hitshapes.push(new Box(ASH_WALL_E_HITBOX_X, ASH_WALL_E_HITBOX_Y, ASH_WALL_E_HITBOX_W, ASH_WALL_E_HITBOX_H, this));
    this.hitshapes.push(new Box(ASH_WALL_S_HITBOX_X, ASH_WALL_S_HITBOX_Y, ASH_WALL_S_HITBOX_W, ASH_WALL_S_HITBOX_H, this));
	//start the level's audio
	var audio = document.getElementById("terran3");
	audio.play();

	var guardianCount = 0;
    var guardians = new SpawnSequence(1, 
        () => { return true },
        () => {
            for (var i = 0; i < GUARDIANS; i++) {
                var x = calcSpawnX(gameEngine, GUA_FRAME_DIM);
                var y = calcSpawnY(gameEngine, GUA_FRAME_DIM);
                guardian = new Guardian(x, y, gameEngine, AM.getAsset("./img/red_guardian.png"), AM.getAsset("./img/gua_zairdthl.png"));
                guardian.onDeathCallbacks.push(()=>{guardianCount--});
                guardian.init(gameEngine);
                gameEngine.addEnemy(guardian);
				guardianCount++;
            }
        });
    gameLevel.spawnSequences.push(guardians);

	var lurkerCount = 0;
    var lurkers = new SpawnSequence(1, 
        () => { return true },
        () => {
            for (var i = 0; i < LURKERS; i++) {
                var x = calcSpawnX(gameEngine, LUR_FRAME_DIM);
                var y = calcSpawnY(gameEngine, LUR_FRAME_DIM);
                var lurker = new Lurker(x, y, gameEngine, AM.getAsset("./img/red_lurker.png"), AM.getAsset("./img/red_lurker.png"));
                lurker.onDeathCallbacks.push(()=>{lurkerCount--});
                lurker.init(gameEngine);
                gameEngine.addEnemy(lurker);
				lurkerCount++;
            }
        });
    gameLevel.spawnSequences.push(lurkers);
	
	var boss = new SpawnSequence(1, 
        () => { return guardianCount == 0 && lurkerCount == 0 },
        () => {
            var x = calcSpawnX(gameEngine, QUE_FRAME_DIM);
            var y = calcSpawnY(gameEngine, QUE_FRAME_DIM);
            var queen = new Queen(x, y, gameEngine, AM.getAsset("./img/red_queen.png"), AM.getAsset("./img/que_zairdthl.png"));
            queen.init(gameEngine);
            gameEngine.addEnemy(queen);
        });
    gameLevel.spawnSequences.push(boss);
}


/**
 * Spawn sequence class
 */
function SpawnSequence(numberOfRuns, spawnCondition, spawnFunc) {
	this.numberOfRuns = numberOfRuns;
	this.timesRun = 0;
    this.spawnCondition = spawnCondition;
    this.spawnFunc = spawnFunc;
}

SpawnSequence.prototype.resolve = function () {
    if (this.spawnCondition() && this.timesRun < this.numberOfRuns) {
        this.spawnFunc();
		this.timesRun++;
    }
}
