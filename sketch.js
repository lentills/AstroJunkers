///////////////////////
//       TODO:
// + Render continuous background
// + Add gun
// - Add enemies
// + Add asteroids
// - Add boss fight
// + Add collisions
// + Build map
// - Menu and character select screens
// - Build characters abilities
// - Extra animations and sparkles
// - Integrate multiplayer
//    - Peer to peer code
//    - data syncing for menu screens
//    - data syncing for gameplay
//    - Character interactions
// - Final artworks
// - Sound effects
// - Music
///////////////////////



// Assets
let spriteShip, spriteFire, spriteStar1, spriteStar2, spriteBullet, spriteMuzzleFlash;


// Character stats
var charID = 0;   // Which character the player has selected
const characterStats =
  [
    { maxSpeed: 350, acceleration: 300, deceleration: 80, maxRotSpeed: 300, rotAcceleration: 800, forwardsFriction: 0.2, sidewaysFriction: 0.3, bulletSpeed: 800, bulletRate: 150 }
  ];



// Utilities
var gameWidth = 1600; 
var gameHeight = 900;

// Game state
var playerShip;



function preload() {
  spriteShip = loadImage('assets/temp/playerShip3_blue.png');
  spriteFire = loadImage('assets/temp/fire14.png');
  spriteStar1 = loadImage('assets/temp/star1.png');
  spriteStar2 = loadImage('assets/temp/star2.png');
  spriteBullet = loadImage('assets/temp/laserBlue05.png');
  spriteMuzzleFlash = loadImage('assets/temp/muzzleFlash.png');

  loadObstacleSprites();
  loadTileSprites();
}



function setup() {

  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  calculateScale();
  angleMode(DEGREES);
  imageMode(CENTER)


  // Setup player
  playerShip = { playerID: 1, character: 0, pos: createVector(2250, 0), rot: 0, rotVel: 0, vel: createVector(0, 0), health: 100, sprite: spriteShip, controlAccel: 0, controlRot: 0, controlFire: false, isCrashing: -1 };
  cameraPos = playerShip.pos.copy();
  cameraVel = playerShip.vel.copy();
  cameraZoom = 3;
  cameraZoomSpeed = 0;

  // Initialise bullet object pool
  for (let i = 0; i < MAX_BULLETS; i++) {
    bullets.push(new Bullet());
  }

  // Initialise obstacle object pool
  for (let i = 0; i < MAX_OBSTACLES; i++) {
    obstacles.push(new Obstacle());
  }


  // TEMP
  createObstacle(createVector(500, -300), createVector(50, -100), 150, 100, 100, 0, false);
  createObstacle(createVector(2200, -1000), createVector(5, -10), 150, 100, 100, 0, false);
  createObstacle(createVector(2300, -1000), createVector(0, -10), 150, 60, 100, 2, true);

}



function draw() {
  background(0);

  // Do scaling to account for screen size
  translate(windowWidth / 2, 0);
  scale(scaleFactor);
  translate(-gameWidth / 2, 0);

  // Draw the background, will not move with the player
  strokeWeight(0);
  fill(10, 0, 20);
  rect(0, 0, gameWidth, gameHeight, 20);

  drawBackground((-playerShip.pos.y) / 30000);  // TODO: Update this number to length of map in pixels
  fill(10, 0, 20, 100);
  rect(0, 0, gameWidth, gameHeight, 20);

  // Move the camera
  push();
  translate(gameWidth / 2, gameHeight / 2);
  scale(cameraZoom);
  translate(-cameraPos.x, -cameraPos.y);

  moveCameraDamped();


  // Do the timestep
  doTimeStep();

  // Draw the scenery
  drawMapTiles(0);

  // TEMP - debug map collisions
  /*for (var x = 0; x < 10 * 500; x += 10) {
    for (var y = 0; y < 30 * 500; y += 10) {
      if (checkMapCollision(0, x, -y) == 1) {
        fill(255, 0, 0);
        rect(x, -y, 5, 5);
      }
    }
  }*/

  // Draw player (temp)
  drawPlayerShip(playerShip);
  drawBullets();
  drawObstacles();


  pop();

  drawBlinders();
}




// Computes everything in the game logic for one time step
// Player movement, enemies, obstacles etc
function doTimeStep() {

  getControls();
  moveShip(playerShip);
  updateObjects();

  checkPlayerCollisions(playerShip);
  checkBulletCollisions(playerShip);

}




// Time step for all objects in the scene (non-player)
function updateObjects() {

  // Update bullet positions
  for (let bullet of bullets) {
    if (bullet.active) {
      bullet.update();
    }
  }

  // Update obstace positions
  for (let obstacle of obstacles) {
    if (obstacle.active) {
      obstacle.update();
    }
  }


}








///////////////////
// UTILITY FUNCS //
///////////////////

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateScale();
}

function calculateScale() {

  let scaleW = width / gameWidth;
  let scaleH = height / gameHeight;

  // Determine which dimension is the constraining factor
  if (width / height > gameWidth / gameHeight) {
    scaleFactor = scaleH;
  } else {
    scaleFactor = scaleW;
  }
}


