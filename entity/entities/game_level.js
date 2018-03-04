
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
}

GameLevel.prototype = Object.create(Entity.prototype);
GameLevel.prototype.constructor = GameLevel;

GameLevel.prototype.update = function () {
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
    //Here is where the outro animation should happen.
    if (gameEngine.currentLevel < gameEngine.levels.length - 1) {//-1 magic number because javascript
        gameEngine.currentLevel++;
        gameEngine.levels[gameEngine.currentLevel].init();
    } else {
        console.log("you won");
        gameEngine.won = true;
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
    var map = new Map(gameEngine, AM.getAsset("./img/map.png"), 1600, 1600);
    gameEngine.map = map;

    var zerglingCount = 0;
    var zerglings = new SpawnSequence(
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
            gameLevel.spawnSequences.splice(this, 1);
        });
    gameLevel.spawnSequences.push(zerglings);

    var hydraliskCount = 0;
    var hydralisks = new SpawnSequence(
        () => { return true },
        () => {
            for (var i = 0; i < HYDRALISKS; i++) {
                var x = calcSpawnX(gameEngine, ZER_FRAME_DIM);
                var y = calcSpawnY(gameEngine, ZER_FRAME_DIM);
                var hydralisk = Hydralisk.quickCreate(gameEngine, x, y);
                hydralisk.onDeathCallbacks.push(() => {hydraliskCount-- });
                gameEngine.addEnemy(hydralisk);
                hydraliskCount++;
            }
            gameLevel.spawnSequences.splice(this, 1);
        });
    gameLevel.spawnSequences.push(hydralisks);

    var boss = new SpawnSequence(
        () => { return hydraliskCount == 0 && zerglingCount == 0 },
        () => {
            var x = calcSpawnX(gameEngine, ZER_FRAME_DIM);
            var y = calcSpawnY(gameEngine, ZER_FRAME_DIM);
            var devourer = new Devourer(x, y, gameEngine, AM.getAsset("./img/red_devourer.png"), AM.getAsset("./img/gua_zairdthl.png"));
            devourer.init(gameEngine);
            gameEngine.addEnemy(devourer);
            gameLevel.spawnSequences.splice(this, 1);
        });
    gameLevel.spawnSequences.push(boss);
}

//Level two init
GameLevel.levelTwoInit = function (gameLevel, gameEngine) {
    var map = new Map(gameEngine, AM.getAsset("./img/map.png"), 1600, 1600);
    gameEngine.map = map;

    var ultraliskCount = 0;
    var ultralisks = new SpawnSequence(
        () => { return true },
        () => {
            for (var i = 0; i < ULTRALISKS; i++) {
                var x = calcSpawnX(gameEngine, ZER_FRAME_DIM);
                var y = calcSpawnY(gameEngine, ZER_FRAME_DIM);
                var ultralisk = new Ultralisk(x, y, gameEngine, AM.getAsset("./img/red_ultralisk.png"), AM.getAsset("./img/red_ultralisk.png"));
                ultralisk.onDeathCallbacks.push(()=>{ultraliskCount--});
                ultralisk.init(gameEngine);
                gameEngine.addEnemy(ultralisk);
                ultraliskCount++;
            }
            gameLevel.spawnSequences.splice(this, 1);
        });
    gameLevel.spawnSequences.push(ultralisks);

    var mutaliskCount = 0;
    var mutalisks = new SpawnSequence(
        () => { return true },
        () => {
            for (var i = 0; i < MUTALISKS; i++) {
                var x = calcSpawnX(gameEngine, ZER_FRAME_DIM);
                var y = calcSpawnY(gameEngine, ZER_FRAME_DIM);
                var mutalisk = new Mutalisk(x, y, gameEngine, AM.getAsset("./img/red_mutalisk.png"), AM.getAsset("./img/mut_zairdthl.png"));
                mutalisk.onDeathCallbacks.push(()=>{mutaliskCount--});
                mutalisk.init(gameEngine);
                gameEngine.addEnemy(mutalisk);
                mutaliskCount++;
            }
            gameLevel.spawnSequences.splice(this, 1);
        });

    gameLevel.spawnSequences.push(mutalisks);
    var boss = new SpawnSequence(
        () => { return ultraliskCount == 0 && mutaliskCount == 0 },
        () => {
            var x = calcSpawnX(gameEngine, ZER_FRAME_DIM);
            var y = calcSpawnY(gameEngine, ZER_FRAME_DIM);
            var devourer = new Devourer(x, y, gameEngine, AM.getAsset("./img/red_devourer.png"), AM.getAsset("./img/gua_zairdthl.png"));
            devourer.init(gameEngine);
            gameEngine.addEnemy(devourer);
            gameLevel.spawnSequences.splice(this, 1);
        });
    gameLevel.spawnSequences.push(boss);
}

//Level three init
GameLevel.levelThreeInit = function (gameLevel, gameEngine) {
    var map = new Map(gameEngine, AM.getAsset("./img/map.png"), 1600, 1600);
    gameEngine.map = map;

    var guardians = new SpawnSequence(
        () => { return true },
        () => {
            for (var i = 0; i < GUARDIANS; i++) {
                var x = calcSpawnX(gameEngine, ZER_FRAME_DIM);
                var y = calcSpawnY(gameEngine, ZER_FRAME_DIM);
                guardian = new Guardian(x, y, gameEngine, AM.getAsset("./img/red_guardian.png"), AM.getAsset("./img/gua_zairdthl.png"));
                guardian.init(gameEngine);
                gameEngine.addEnemy(guardian);
            }
            gameLevel.spawnSequences.splice(this, 1);
        });
    gameLevel.spawnSequences.push(guardians);

    var lurkers = new SpawnSequence(
        () => { return true },
        () => {
            for (var i = 0; i < LURKERS; i++) {
                var x = calcSpawnX(gameEngine, ZER_FRAME_DIM);
                var y = calcSpawnY(gameEngine, ZER_FRAME_DIM);
                var lurker = new Lurker(x, y, gameEngine, AM.getAsset("./img/red_lurker.png"), AM.getAsset("./img/red_lurker.png"));
                lurker.init(gameEngine);
                gameEngine.addEnemy(lurker);
            }
            gameLevel.spawnSequences.splice(this, 1);
        });
    gameLevel.spawnSequences.push(lurkers);
}


/**
 * Spawn sequence class
 */
function SpawnSequence(spawnCondition, spawnFunc) {
    this.spawnCondition = spawnCondition;
    this.spawnFunc = spawnFunc;
}

SpawnSequence.prototype.resolve = function () {
    if (this.spawnCondition()) {
        this.spawnFunc();
    }
}