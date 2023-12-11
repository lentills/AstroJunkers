///////////////////////
//
//       TODO:
// + Render continuous background
// + Add gun
// + Add enemies
// + Add asteroids
// + Add boss fight
// + Add collisions
// + Build map
// + Menu and character select screens
// - Build characters abilities
//    - Hopper and Skipp
//    + Nyx
//    + Yasmin
// + Cooldowns and health bar
// - Character HUDS
// + Add crystals and scoring system
// + Integrate multiplayer
//    + Peer to peer code
//    + data syncing for menu screens
//    + data syncing for gameplay
//    + Character interactions
// - Final artworks
//    + Character Splashes
//    + Asteroids
//    - Enemies
//    - Hopper and Skipp Missile
//    - Debris
//    - Character HUDS
//    + Menu screens
// - Sound effects
// - Music
// - Extra animations and sparkles
//    - Particles when colliding with walls
//    + Particles ejected from ship - interact with opponent ship?
//    + Explosions!
//
// - Bugfixes
//    + When tabbing out of the game, deta time becomes large and causes glitched location when logging back in
//    + Targets get stuck in red state for client sometimes, like when host is tabbed out
//    - Translate the multiplayer text box to the middle of the screen properly
//
///////////////////////


const WEBGL_MODE_ENABLED = false; // Set to true to use WEBGL (better colours, better performance for more sprites, causes lag spikes and graphics bugs though


// Assets
let spriteStar1, spriteStar2, spriteCrystal;
let spriteShip = [];
let spriteFire = [];
let spriteMuzzleFlash = [];


// Character stats
const characterStats =
  [
    { health:100, maxSpeed: 350, acceleration: 300, deceleration: 220, maxRotSpeed: 300, rotAcceleration: 800, forwardsFriction: 0.2, sidewaysFriction: 0.3, bulletSpeed: 800, bulletRate: 160 },   // Hopper and Skipp, agile, powerful weapons
    { health:80, maxSpeed: 400, acceleration: 310, deceleration: 220, maxRotSpeed: 320, rotAcceleration: 750, forwardsFriction: 0.2, sidewaysFriction: 0.3, bulletSpeed: 900, bulletRate: 120 },    // Nyx, fast and agile, less strong
    { health:120, maxSpeed: 370, acceleration: 290, deceleration: 150, maxRotSpeed: 240, rotAcceleration: 550, forwardsFriction: 0.1, sidewaysFriction: 0.4, bulletSpeed: 1200, bulletRate: 100 }   // Yasmin, fast but low maneuverability, powerful weapons, tough
  ];



// Utilities
var gameWidth = 1600; 
var gameHeight = 900;
var appState = -1;     // 0-in-game  1-main menu  2-multiplayer lobby  3-character select
var startGameCountdown = 0;
var gameInSession = -1;

// Game state
var playerID;
var playerShip, opponentShip;
var multiplayer;



function preload() {

  spriteStar1 = loadImage('assets/star1.png');
  spriteStar2 = loadImage('assets/star2.png');
  spriteCrystal = loadImage('assets/Energy_Crystal.png');

  spriteShip.push (loadImage('assets/HopperSkippShip.png'));
  spriteShip.push (loadImage('assets/nyxShip.png'));
  spriteShip.push (loadImage('assets/yasminShip.png'));

  spriteMuzzleFlash.push (loadImage('assets/MuzzleFlash1.png'));
  spriteMuzzleFlash.push (loadImage('assets/MuzzleFlash2.png'));
  spriteMuzzleFlash.push (loadImage('assets/MuzzleFlash3.png'));
  spriteMuzzleFlash.push (loadImage('assets/MuzzleFlash4.png'));

  spriteFire.push (loadImage('assets/fireHopperSkipp.png'));
  spriteFire.push (loadImage('assets/fireNyx.png'));
  spriteFire.push (loadImage('assets/fireYasmin.png'));

  loadObstacleSprites();
  loadTileSprites();
  loadBossSprites();
  loadExplosionSprites();
  loadMenuAssets();
  loadBulletSprites();
  initialiseSound();
}



function setup() {

  frameRate(50);

  if (WEBGL_MODE_ENABLED){
    createCanvas(windowWidth, windowHeight, WEBGL);
  }else{
    createCanvas(windowWidth, windowHeight);
  }
  
  calculateScale();
  angleMode(DEGREES);
  imageMode(CENTER)

  initialiseStarfield();

  appState = -1;

}



function draw() {

  frameRate(50);

  if (deltaTime > 1000){  // Tabbing out can cause big delta time spikes leading to glitches. Ignore the tick if there is a big delta time
    return;
  }

  background(0);

  if (WEBGL_MODE_ENABLED){
    // Translate to top-left corner (WEBGL origin is centre of screen)
    translate(-width / 2, -height / 2);
  }

  // Do scaling to account for screen size
  translate(windowWidth / 2, 0);
  scale(scaleFactor);
  translate(-gameWidth / 2, 0);

  if (appState == -1){
    drawInitialScreen();
  }

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

  
  // Print framerate
  fill(200, 200, 200, 50);
  textSize(20);
  textAlign(LEFT, CENTER);
  text(floor(frameRate()), 20, 10);


  drawBlinders();

  // Adjust sound volume levels
  soundManager.setSFXVolumes(slider2.value());

  if (startGameCountdown < 10 && (gameInSession > 0 || appState != 0)){ // Don't adjust menu music volume in the fadeout stage
    soundManager.setMusicVolumes(slider1.value());
  }

  
}




// If appstate == 0 we are in game, this does all the things we need to do each frame
function drawGame(){
  // Draw the background, will not move with the player
  strokeWeight(0);
  fill(7, 4, 70);
  rect(0, 0, gameWidth, gameHeight, 40);
  
  drawBackground((-playerShip.pos.y) / 30000);  // TODO: Update this number to length of map in pixels
  fill(7, 4, 60, 100);
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

  // Do animated explosions
  handleExplosions();

  // Draw players
  drawPlayerShip(playerShip);
  if (multiplayer){
    drawPlayerShip(opponentShip);
  }

  // Draw other scene objects
  drawBullets();
  drawObstacles();
  drawTargets();
  drawCrystals();
  drawParticles();
  doMissiles();

  pop();

  // Draw GUI elements
  drawHealthBar(playerShip);
  drawCooldown(playerShip);
  drawUltimateBar();
  drawScore(playerShip);

  if (startGameCountdown > 0){
    drawStartGameCountdown();
  }

  if (gameInSession < 0){
    endGameScreen();
  }
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

  // Update crystal positions
  for (let crystal of crystals) {
    if (crystal.active) {
      crystal.update();
    }
  }

   // Update particle positions
  for (let particle of particles) {
    if (particle.active) {
      particle.update();
    }
  }

}






/////
// Setup singleplayer game
/////

function setupSingleplayer(playerCharacter){

  // Setup player
  multiplayer = false;
  ultimateCharge = 0;
  playerShip = { playerID: 1, character: playerCharacter, pos: createVector(2250, -19*tileSize), rot: 0, rotVel: 0, vel: createVector(0, 0), health: 70, sprite: spriteShip[playerCharacter], controlAccel: 0, controlRot: 0, controlFire: false, isCrashing: -1, invincibility: 0, fireCooldown: 3000, ultimate:0, score:0 };
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
    targets.push(new Target());
  }

  // Initialise crystal object pool
  crystals = [];
  for (let i=0; i<MAX_CRYSTALS; i++){
    crystals.push(new Crystal());
  }

  // Initialise particle object pool
  particles = [];
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push(new Particle());
  }


  // Initialise obstacles
  // Boss fight henchmen
  createObstacle(-1, createVector(5*tileSize-150, -BOSS_POSITION*tileSize+220), createVector(0, -10), 150, 60, 150, 4, true, 100);
  createObstacle(-1, createVector(5*tileSize+150, -BOSS_POSITION*tileSize+220), createVector(0, -10), 150, 60, 150, 4, true, 100);

  // Random asteroids
  createObstacle(-1, createVector(4*tileSize+20, -4*tileSize-190), createVector(5, -4), 120, 120, 60, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize-40, -4*tileSize-200), createVector(3, 7), 100, 100, 50, 1, false, 0);

  // Asteroid blockage
  createObstacle(-1, createVector(4*tileSize+190, -19*tileSize-180), createVector(0, 0), 120, 80, 60, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize+300, -19*tileSize-200), createVector(0, 0), 100, 100, 50, 1, false, 0);
  createObstacle(-1, createVector(4*tileSize+330, -19*tileSize-280), createVector(0, 0), 80, 60, 40, 2, false, 0);
  createObstacle(-1, createVector(4*tileSize+280, -19*tileSize-330), createVector(0, 0), 90, 60, 40, 2, false, 0);
  createObstacle(-1, createVector(4*tileSize+210, -19*tileSize-280), createVector(0, 0), 110, 90, 50, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize+400, -19*tileSize-280), createVector(0, 0), 110, 90, 50, 1, false, 0);
  createObstacle(-1, createVector(4*tileSize+415, -19*tileSize-200), createVector(0, 0), 100, 100, 50, 2, false, 0);
  createObstacle(-1, createVector(4*tileSize+105, -19*tileSize-200), createVector(0, 0), 30, 30, 20, 3, false, 0);
  

  // Initialise the positions of the boss targets
  targets[0].create(createVector(5*tileSize-150, -BOSS_POSITION*tileSize+145), 300, 0);
  targets[1].create(createVector(5*tileSize-3,   -BOSS_POSITION*tileSize+145), 300, 1);
  targets[2].create(createVector(5*tileSize+135, -BOSS_POSITION*tileSize+133), 300, 2);
  targets[3].create(createVector(5*tileSize+260, -BOSS_POSITION*tileSize+110), 300, 3);
  bossAlive = true;
  enemyMissileActive = false;
  friendlyMissileActive = false;
  startGameCountdown = 3000;  // 3 second intro to game

  gameInSession = 1;
  
  // Play the game music
  soundManager.stop('music1');
  soundManager.play('music2');

}



/////
// Setup multiplayer game
/////

function setupMultiplayerplayer(playerCharacter, opponentCharacter){

  // Setup player
  multiplayer = true;
  ultimateCharge = 0;
  lastObstacleID = 0;
  playerShip = { playerID: playerID, character: playerCharacter, pos: createVector(2200 + (playerID-1)*100, -19*tileSize), rot: 0, rotVel: 0, vel: createVector(0, 0), health: 70, sprite: spriteShip[playerCharacter], controlAccel: 0, controlRot: 0, controlFire: false, isCrashing: -1, invincibility: 0, fireCooldown: 3000, ultimate:0, score:0};
  opponentShip = { playerID: playerID%2+1, character: opponentCharacter, pos: createVector(2200 + (playerID%2)*100, -19*tileSize), rot: 0, rotVel: 0, vel: createVector(0, 0), health: 70, sprite: spriteShip[opponentCharacter], controlAccel: 0, controlRot: 0, controlFire: false, isCrashing: -1, invincibility: 0, fireCooldown: 3000, ultimate:0, score:0 };
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

  // Initialise crystal object pool
  crystals = [];
  for (let i=0; i<MAX_CRYSTALS; i++){
    crystals.push(new Crystal())
  }


  // Initialise obstacles
  // Boss fight henchmen
  createObstacle(-1, createVector(5*tileSize-150, -BOSS_POSITION*tileSize+220), createVector(0, -10), 150, 60, 150, 4, true, 100);
  createObstacle(-1, createVector(5*tileSize+150, -BOSS_POSITION*tileSize+220), createVector(0, -10), 150, 60, 150, 4, true, 100);

  // Random asteroids
  createObstacle(-1, createVector(4*tileSize+20, -4*tileSize-190), createVector(5, -4), 120, 120, 60, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize-40, -4*tileSize-200), createVector(3, 7), 100, 100, 50, 1, false, 0);

  // Asteroid blockage
  createObstacle(-1, createVector(4*tileSize+190, -19*tileSize-180), createVector(0, 0), 120, 80, 60, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize+300, -19*tileSize-200), createVector(0, 0), 100, 100, 50, 1, false, 0);
  createObstacle(-1, createVector(4*tileSize+330, -19*tileSize-280), createVector(0, 0), 80, 60, 40, 2, false, 0);
  createObstacle(-1, createVector(4*tileSize+280, -19*tileSize-330), createVector(0, 0), 90, 60, 40, 2, false, 0);
  createObstacle(-1, createVector(4*tileSize+210, -19*tileSize-280), createVector(0, 0), 110, 90, 50, 0, false, 0);
  createObstacle(-1, createVector(4*tileSize+400, -19*tileSize-280), createVector(0, 0), 110, 90, 50, 1, false, 0);
  createObstacle(-1, createVector(4*tileSize+415, -19*tileSize-200), createVector(0, 0), 100, 100, 50, 2, false, 0);
  createObstacle(-1, createVector(4*tileSize+105, -19*tileSize-200), createVector(0, 0), 30, 30, 20, 3, false, 0);
  

  // Initialise the positions of the boss targets
  targets[0].create(createVector(5*tileSize-150, -BOSS_POSITION*tileSize+145), 300, 0);
  targets[1].create(createVector(5*tileSize-3,   -BOSS_POSITION*tileSize+145), 300, 1);
  targets[2].create(createVector(5*tileSize+135, -BOSS_POSITION*tileSize+133), 300, 2);
  targets[3].create(createVector(5*tileSize+260, -BOSS_POSITION*tileSize+110), 300, 3);
  bossAlive = true;
  enemyMissileActive = false;
  friendlyMissileActive = false;
  startGameCountdown = 3000;  // 3 second intro to game

  gameInSession = 1;

  // Play the game music
  soundManager.stop('music1');
  soundManager.play('music2');
  
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


