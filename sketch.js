///////////////////////
//       TODO:
// + Render continuous background
// + Add gun
// + Add enemies
// + Add asteroids
// - Add boss fight
// + Add collisions
// + Build map
// - Menu and character select screens
// - Build characters abilities
// + Integrate multiplayer
//    + Peer to peer code
//    - data syncing for menu screens
//    + data syncing for gameplay
//    + Character interactions
// - Final artworks
// - Sound effects
// - Music
// - Extra animations and sparkles
///////////////////////


// Obstacles are glitching.
//  - Closest player controls them?
//  - Only host controls them?


// Assets
let spriteShip, spriteFire, spriteStar1, spriteStar2, spriteBullet, spriteMuzzleFlash;


// Character stats
const characterStats =
  [
    { health:80, maxSpeed: 350, acceleration: 300, deceleration: 160, maxRotSpeed: 300, rotAcceleration: 800, forwardsFriction: 0.2, sidewaysFriction: 0.3, bulletSpeed: 900, bulletRate: 120 }
  ];



// Utilities
var gameWidth = 1600; 
var gameHeight = 900;
var appState = 1;     // 0-in-game  1-main menu  2-multiplayer lobby  3-character select

// Game state
var playerID;
var playerShip, opponentShip;
var multiplayer;



function preload() {
  spriteShip = loadImage('assets/temp/playerShip3_blue.png');
  spriteFire = loadImage('assets/temp/fire14.png');
  spriteStar1 = loadImage('assets/temp/star1.png');
  spriteStar2 = loadImage('assets/temp/star2.png');
  spriteBullet = loadImage('assets/temp/laserBlue05.png');
  spriteMuzzleFlash = loadImage('assets/temp/muzzleFlash.png');

  loadObstacleSprites();
  loadTileSprites();
  loadBossSprites();
}



function setup() {

  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  calculateScale();
  angleMode(DEGREES);
  imageMode(CENTER)

  // Check if there is a peer id in the url, and if so go straight to multiplayer screen
  var peerID = getPeerIDFromURL();
  if (peerID) {
    appState = 2;
    playerID = 2;
    setupClient(peer, peerID);
  }else{
    playerID = 1;
  }

}



function draw() {
  background(0);

  // Do scaling to account for screen size
  translate(windowWidth / 2, 0);
  scale(scaleFactor);
  translate(-gameWidth / 2, 0);


  if (appState == 0){
    drawGame();
  }

  if (appState == 1){
    drawMainMenu();
  }

  if (appState == 2){
    drawMutliplayerLobby();
  }

  if (appState == 3){
    drawCharacterSelect();
  }


  drawBlinders();
}




// If appstate == 0 we are in game, this does all the things we need to do each frame
function drawGame(){
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

  // Draw players
  drawPlayerShip(playerShip);
  if (multiplayer){
    drawPlayerShip(opponentShip);
  }

  // Draw other scene objects
  drawBullets();
  drawObstacles();


  pop();
}



// Computes everything in the game logic for one time step
// Player movement, enemies, obstacles etc
function doTimeStep() {

  getControls();
  moveShip(playerShip);
  if (multiplayer){
    moveShip(opponentShip);
    checkPlayerCollisions(opponentShip);
  }
  updateObjects();

  checkPlayerCollisions(playerShip);
  checkBulletCollisions();

  if (multiplayer){
    syncGamestates();
  }

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






/////
// Setup singleplayer game
/////

function setupSingleplayer(){

  // Setup player
  multiplayer = false;
  playerShip = { playerID: 1, character: 0, pos: createVector(2250, 0), rot: 0, rotVel: 0, vel: createVector(0, 0), health: 100, sprite: spriteShip, controlAccel: 0, controlRot: 0, controlFire: false, isCrashing: -1 };
  cameraPos = playerShip.pos.copy();
  cameraVel = playerShip.vel.copy();
  cameraZoom = 3;
  cameraZoomSpeed = 0;

  // Initialise bullet object pool
  bullets = [];
  for (let i = 0; i < MAX_BULLETS; i++) {
    bullets.push(new Bullet());
  }

  // Initialise obstacle object pool
  obstacles = [];
  for (let i = 0; i < MAX_OBSTACLES; i++) {
    obstacles.push(new Obstacle());
  }


  // TEMP
  createObstacle(-1, createVector(500, -300), createVector(50, -100), 150, 100, 100, 0, false, 0);
  createObstacle(-1, createVector(2200, -1000), createVector(5, -10), 150, 100, 100, 0, false, 0);
  createObstacle(-1, createVector(2300, -1000), createVector(0, -10), 150, 60, 100, 2, true, 250);
}



/////
// Setup multiplayer game
/////

function setupMultiplayerplayer(){

  // Setup player
  multiplayer = true;
  playerShip = { playerID: playerID, character: 0, pos: createVector(2200 + (playerID-1)*100, 0), rot: 0, rotVel: 0, vel: createVector(0, 0), health: 100, sprite: spriteShip, controlAccel: 0, controlRot: 0, controlFire: false, isCrashing: -1 };
  opponentShip = { playerID: playerID%2+1, character: 0, pos: createVector(2200 + (playerID%2)*100, 0), rot: 0, rotVel: 0, vel: createVector(0, 0), health: 100, sprite: spriteShip, controlAccel: 0, controlRot: 0, controlFire: false, isCrashing: -1 };
  cameraPos = playerShip.pos.copy();
  cameraVel = playerShip.vel.copy();
  cameraZoom = 3;
  cameraZoomSpeed = 0;

  // Initialise bullet object pool
  bullets = [];
  for (let i = 0; i < MAX_BULLETS; i++) {
    bullets.push(new Bullet());
  }

  // Initialise obstacle object pool
  obstacles = [];
  for (let i = 0; i < MAX_OBSTACLES; i++) {
    obstacles.push(new Obstacle());
  }


  // TEMP
  if (playerID == 1){
    createObstacle(-1, createVector(500, -300), createVector(50, -100), 150, 100, 100, 0, false, 0);
    createObstacle(-1, createVector(2200, -1000), createVector(5, -10), 150, 100, 100, 0, false, 0);
    createObstacle(-1, createVector(2300, -1000), createVector(0, -10), 150, 60, 100, 2, true, 250);
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


