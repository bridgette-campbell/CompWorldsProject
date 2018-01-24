var AM = new AssetManager();

//Initialize the game engine



//Animation moved to its own file.

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};

AM.queueDownload("./img/background.jpg");
AM.queueDownload("./img/marine.png");
AM.queueDownload("./img/hydralisk.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));

    var marine = new Marine(gameEngine, AM.getAsset("./img/marine.png"));
	var hydralisk = new Hydralisk(gameEngine, AM.getAsset("./img/hydralisk.png"));

	//init player
    initializePlayerListeners(marine, canvas);
	
	//init enemies
	initializeEnemyListeners(hydralisk, canvas);

    gameEngine.addEntity(marine);
	gameEngine.addEntity(hydralisk);

    gameEngine.start();
    console.log("All Done!");
});

function initializePlayerListeners(marine, canvas) {


    canvas.addEventListener("keypress", function (e) {
        //console.log(e.code);
        if (e.code === "KeyW") {
            marine.movementFactor.north = 1;
        }

        if (e.code === "KeyS") {
            marine.movementFactor.south = 1;
        }

        if (e.code === "KeyA") {
            marine.movementFactor.west = 1;
        }

        if (e.code === "KeyD") {
            marine.movementFactor.east = 1;
        }

    }, false);
    
    canvas.addEventListener("keyup", function (e) {
        //console.log("Key up!");
        if (e.code === "KeyW") {
            marine.movementFactor.north = 0;
        }

        if (e.code === "KeyS") {
            marine.movementFactor.south = 0;
        }

        if (e.code === "KeyA") {
            marine.movementFactor.west = 0;
        }

        if (e.code === "KeyD") {
            marine.movementFactor.east = 0;
        }

    }, false);
    
}

function initializeEnemyListeners(hydralisk, canvas) {
	
}