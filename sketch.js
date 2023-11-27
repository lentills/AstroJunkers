///////////////////////
//
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
// - Cooldowns and health bar
// + Integrate multiplayer
//    + Peer to peer code
//    - data syncing for menu screens
//    + data syncing for gameplay
//    + Character interactions
// - Final artworks
// - Sound effects
// - Music
// - Extra animations and sparkles
//    - Particles when colliding with walls
//    - Particles ejected from ship - interact with opponent ship?
//
// - Bugfixes
//    + When tabbing out of the game, deta time becomes large and causes glitched location when logging back in
//    + Targets get stuck in red state for client sometimes, like when host is tabbed out
//
///////////////////////



// Assets
let spriteShip, spriteFire, spriteStar1, spriteStar2, spriteBullet;
let spriteMuzzleFlash = [];


// Character stats
const characterStats =
  [
    { health:90, maxSpeed: 330, acceleration: 300, deceleration: 220, maxRotSpeed: 300, rotAcceleration: 800, forwardsFriction: 0.2, sidewaysFriction: 0.3, bulletSpeed: 800, bulletRate: 140 },
    { health:80, maxSpeed: 370, acceleration: 300, deceleration: 200, maxRotSpeed: 320, rotAcceleration: 750, forwardsFriction: 0.2, sidewaysFriction: 0.3, bulletSpeed: 900, bulletRate: 120 },
    { health:110, maxSpeed: 390, acceleration: 250, deceleration: 200, maxRotSpeed: 250, rotAcceleration: 700, forwardsFriction: 0.15, sidewaysFriction: 0.35, bulletSpeed: 900, bulletRate: 100 }
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
  spriteShip = loadImage('assets/temp/nyxShip.png');
  spriteFire = loadImage('assets/temp/fire14.png');
  spriteStar1 = loadImage('assets/temp/star1.png');
  spriteStar2 = loadImage('assets/temp/star2.png');
  spriteBullet = loadImage('assets/temp/laserBlue05.png');
  spriteMuzzleFlash.push (loadImage('assets/temp/muzzleFlash1.png'));
  spriteMuzzleFlash.push (loadImage('assets/temp/muzzleFlash2.png'));
  spriteMuzzleFlash.push (loadImage('assets/temp/muzzleFlash3.png'));

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

  if (deltaTime > 1000){  // Tabbing out can cause big delta time spikes leading to glitches. Ignore the tick if there is a big delta time
    return;
  }

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
  fill(7, 6, 56);
  rect(0, 0, gameWidth, gameHeight, 40);
  
  drawBackground((-playerShip.pos.y) / 30000);  // TODO: Update this number to length of map in pixels
  fill(7, 6, 56, 100);
  rect(0, 0, gameWidth, gameHeight, 40);

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
  drawTargets();

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

  // Update obstace positions
  for (let target of targets) {
    if (target.active) {
      target.update();
    }
  }


}






/////
// Setup singleplayer game
/////

function setupSingleplayer(playerCharacter){

  // Setup player
  multiplayer = false;
  playerShip = { playerID: 1, character: playerCharacter, pos: createVector(2250, -17*tileSize), rot: 0, rotVel: 0, vel: createVector(0, 0), health: 100, sprite: spriteShip, controlAccel: 0, controlRot: 0, controlFire: false, isCrashing: -1 };
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

  // Initialise target object pool
  targets = [];
  for (let i=0; i<NUM_TARGETS; i++){
    targets.push(new Target())
  }


  // Initialise obstacles
  // Boss fight henchmen
  createObstacle(-1, createVector(5*tileSize-150, -BOSS_POSITION*tileSize+220), createVector(0, -10), 150, 60, 150, 2, true, 100);
  createObstacle(-1, createVector(5*tileSize+150, -BOSS_POSITION*tileSize+220), createVector(0, -10), 150, 60, 150, 2, true, 100);


  // Random asteroids
  createObstacle(-1, createVector(4*tileSize+20, -4*tileSize-190), createVector(5, -4), 120, 120, 60, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize-40, -4*tileSize-200), createVector(3, 7), 100, 100, 50, 1, false, 0);

  // Asteroid blockage
  createObstacle(-1, createVector(4*tileSize+190, -19*tileSize-180), createVector(0, 0), 120, 80, 60, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize+300, -19*tileSize-200), createVector(0, 0), 100, 100, 50, 1, false, 0);
  createObstacle(-1, createVector(4*tileSize+330, -19*tileSize-280), createVector(0, 0), 80, 60, 40, 1, false, 0);
  createObstacle(-1, createVector(4*tileSize+280, -19*tileSize-330), createVector(0, 0), 90, 60, 40, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize+210, -19*tileSize-280), createVector(0, 0), 110, 90, 50, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize+400, -19*tileSize-280), createVector(0, 0), 110, 90, 50, 1, false, 0);
  createObstacle(-1, createVector(4*tileSize+415, -19*tileSize-200), createVector(0, 0), 100, 100, 50, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize+105, -19*tileSize-200), createVector(0, 0), 30, 30, 20, 0, false, 0);
  

  // Initialise the positions of the boss targets
  targets[0].create(createVector(5*tileSize-150, -BOSS_POSITION*tileSize+145), 300, 0);
  targets[1].create(createVector(5*tileSize-3,   -BOSS_POSITION*tileSize+145), 300, 1);
  targets[2].create(createVector(5*tileSize+135, -BOSS_POSITION*tileSize+133), 300, 2);
  targets[3].create(createVector(5*tileSize+260, -BOSS_POSITION*tileSize+110), 300, 3);
  bossAlive = true;

}



/////
// Setup multiplayer game
/////

function setupMultiplayerplayer(){

  // Setup player
  multiplayer = true;
  playerShip = { playerID: playerID, character: 0, pos: createVector(2200 + (playerID-1)*100, -14*tileSize), rot: 0, rotVel: 0, vel: createVector(0, 0), health: 100, sprite: spriteShip, controlAccel: 0, controlRot: 0, controlFire: false, isCrashing: -1 };
  opponentShip = { playerID: playerID%2+1, character: 0, pos: createVector(2200 + (playerID%2)*100, -14*tileSize), rot: 0, rotVel: 0, vel: createVector(0, 0), health: 100, sprite: spriteShip, controlAccel: 0, controlRot: 0, controlFire: false, isCrashing: -1 };
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

  // Initialise target object pool
  targets = [];
  for (let i=0; i<NUM_TARGETS; i++){
    targets.push(new Target())
  }

  // Initialise the positions of the boss targets
  targets[0].create(createVector(5*tileSize-150, -BOSS_POSITION*tileSize+145), 300, 0);
  targets[1].create(createVector(5*tileSize-3,   -BOSS_POSITION*tileSize+145), 300, 1);
  targets[2].create(createVector(5*tileSize+135, -BOSS_POSITION*tileSize+133), 300, 2);
  targets[3].create(createVector(5*tileSize+260, -BOSS_POSITION*tileSize+110), 300, 3);
  bossAlive = true;


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


