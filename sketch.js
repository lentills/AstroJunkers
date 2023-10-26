///////////////////////
//       TODO:
// - Render continuous background
// + Add gun
// - Add enemies
// - Add asteroids
// - Add boss fight
// - Build map (procedurally generated??)
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
let spriteShip, spriteFire, spriteStar1, spriteStar2, spriteBullet;

// Character stats
var charID = 0;   // Which character the player has selected
const characterStats = 
  [
    {maxSpeed:350, acceleration:300, deceleration:80, maxRotSpeed:300, rotAcceleration:800, forwardsFriction:0.2, sidewaysFriction:0.3, bulletSpeed:20, bulletRate:5  }
  ];

// Utilities
var gameWidth = 1600;
var gameHeight = 900;
var cameraAgility = 1;
var cameraPos, cameraVel, cameraZoom, cameraZoomSpeed;

// Game state
var playerShip;

// Objects
const MAX_BULLETS = 200;
let bullets = [];



function preload() {
  spriteShip = loadImage('assets/temp/playerShip3_blue.png');
  spriteFire = loadImage('assets/temp/fire14.png');
  spriteStar1 = loadImage('assets/temp/star1.png');
  spriteStar2 = loadImage('assets/temp/star2.png');
  spriteBullet = loadImage('assets/temp/laserBlue05.png');
}



function setup() {
  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  calculateScale();

  // Setup player
  angleMode(DEGREES);
  imageMode(CENTER)
  playerShip = { character: 0, pos: createVector(800, 800), rot: 0, rotVel: 0, vel: createVector(0, 0), sprite: spriteShip, controlAccel:0, controlRot:0, controlFire:false };
  cameraPos = playerShip.pos.copy();
  cameraVel = playerShip.vel.copy();
  cameraZoom = 3;
  cameraZoomSpeed = 0;

  for (let i = 0; i < MAX_BULLETS; i++) {
    bullets.push(new Bullet());
  }

}



function draw() {
  background(0);

  push();
  

  // Do scaling to account for screen size
  translate(windowWidth / 2, 0);
  scale(scaleFactor);
  translate(-gameWidth / 2, 0);

  // Draw the background, will not move with the player
  strokeWeight(0);
  fill(10, 0, 20);
  rect(0, 0, gameWidth, gameHeight, 20);

  drawStarfield(2);
  fill(10, 0, 20, 100);
  rect(0, 0, gameWidth, gameHeight, 20);


  // Do the timestep
  doTimeStep();


  // Move the camera
  push();
  
  // Translate to the center
  translate(gameWidth / 2, gameHeight / 2);
  // Apply the camera zoom here
  scale(cameraZoom);
  // Translate by the negative camera position after scaling
  translate(-cameraPos.x, -cameraPos.y);
  
  moveCameraDamped();

  drawStarfield(5);

  // Draw player (temp)
  drawPlayerShip(playerShip);
  drawBullets();


  pop();

  drawBlinders();

  pop();
}





function doTimeStep() {

  getControls();
  moveShip(playerShip);
  updateObjects();

}










////////////////
// GAME FUNCS //
////////////////


// Gets the player controls and applies them to the player ship
function getControls() {

  playerShip.controlAccel = 0;
  playerShip.controlRot = 0;

  if (keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW) || keyIsDown(87) && !keyIsDown(83)) {
    playerShip.controlAccel = characterStats[charID].acceleration;  // TODO: update these values to the individual ships stats
  }

  if (keyIsDown(DOWN_ARROW) && !keyIsDown(UP_ARROW) || keyIsDown(83) && !keyIsDown(87)) {
    playerShip.controlAccel = -characterStats[charID].deceleration;
  }

  if (keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW) || keyIsDown(65) && !keyIsDown(68)) {
    playerShip.controlRot = -characterStats[charID].rotAcceleration;
  }

  if (keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW) || keyIsDown(68) && !keyIsDown(65)) {
    playerShip.controlRot = characterStats[charID].rotAcceleration;
  }

  if (keyIsDown(32)){
    playerShip.controlFire = true;
  }else{
    playerShip.controlFire = false;
  }

}


function moveShip(ship) {
  // Rotate the player
  ship.rotVel += ship.controlRot * deltaTime * 0.001
  ship.rot += ship.rotVel * deltaTime * 0.001;

  // Add the acceleration to the players ship
  ship.vel.add(createVector(0, ship.controlAccel).rotate(-ship.rot).mult(deltaTime * 0.001));

  // Move the player
  ship.pos.add(ship.vel.x * deltaTime * 0.001, -ship.vel.y * deltaTime * 0.001);


  // Apply friction to rotation
  ship.rotVel = min(max(ship.rotVel, -characterStats[charID].maxRotSpeed), characterStats[charID].maxRotSpeed);
  ship.rotVel -= (ship.rotVel * 0.7) * deltaTime * 0.001;
  if (ship.rotVel > 1) {
    ship.rotVel -= 100 * deltaTime * 0.001;
  }
  if (ship.rotVel < -1) {
    ship.rotVel += 100 * deltaTime * 0.001;
  }

  // Apply friction to motion
  var sidewaysComponent = createVector(cos(ship.rot), -sin(ship.rot));
  var sidewaysVelocity = ship.vel.dot(sidewaysComponent);
  var frictionForce = sidewaysComponent.mult(sidewaysVelocity * deltaTime * 0.001 * characterStats[charID].sidewaysFriction);
  ship.vel.sub(frictionForce);
  ship.vel.mult(1 - (deltaTime * 0.001 * characterStats[charID].forwardsFriction));   // Forwards friction multiplier 0.5

  if (ship.vel.mag() > characterStats[charID].maxSpeed){
    ship.vel.mult(0.99);
  }

  // Fire bullets
  if (playerShip.controlFire && frameCount%characterStats[charID].bulletRate == 0){
    fireBullet(  p5.Vector.add(playerShip.pos, p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), 20 )), p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), characterStats[charID].bulletSpeed ) );
  }

}


// Moves the camera to follow the ship.
// Follows the point slightly ahead of the vector the ship is travelling in
// Introduces a bit of dampening to make the ship feel faster
function moveCameraDamped() {
  let dampeningFactor = 0.95;
  cameraVel.lerp(playerShip.vel, 1 - dampeningFactor);
  
  let offset = createVector(cameraVel.x * 0.5, -cameraVel.y * 0.5);
  let targetPoint = p5.Vector.add(playerShip.pos, offset);

  //fill(255, 0, 0);
  //rect(targetPoint.x, targetPoint.y, 5, 5);

  let ease = (t) => t * t * (3 - 2 * t);  // Simple easeInOut function. You can replace with other easing functions.
  let easedAgility = ease(cameraAgility * deltaTime * 0.01);
  cameraPos.lerp(targetPoint, easedAgility);
  //cameraPos = playerShip.pos.copy();

  if (p5.Vector.sub(cameraPos, targetPoint).mag() > 300){ // If the camera gets super far away (sometimes happens when tabbing out) move it back
    cameraPos = targetPoint.copy();
  }

  // Control camera zoom based on speed
  cameraZoomSpeed = cameraZoom - map(playerShip.vel.mag() / characterStats[charID].maxSpeed, 0, 1, 2, 0.8);
  cameraZoom -= cameraZoomSpeed * deltaTime * 0.0003;

  if (cameraZoom > 3){cameraZoom = 3;}
  if (cameraZoom < 0.5){cameraZoom = 0.5;}
}








/////////////
// OBJECTS //
/////////////


// Time step for all objects in the scene
function updateObjects(){

  // Update bullet positions
  for (let bullet of bullets) {
    if (bullet.active) {
      bullet.update();
    }
  }


}


class Bullet {
  constructor() {
    this.active = false;
    this.position = createVector(0, 0);
    this.velocity = createVector(0, 0);
    this.age = 0;
  }

  update() {
    if (this.active) {
      this.position.add(this.velocity);
      this.age += deltaTime;
      if (this.age > 1000){
        this.deactivate();
      }
    }
  }

  fire(pos, vel) {
    this.active = true;
    this.position = pos.copy();
    this.velocity = vel.copy();
    this.age = 0;
  }

  deactivate() {
    this.active = false;
  }
}

// Find an inactive bullet and fire it
function fireBullet(pos, direction) {
  for (let bullet of bullets) {
    if (!bullet.active) {
      bullet.fire(pos, direction);
      break;
    }
  }
}




////////////////////
// GRAPHICS FUNCS //
////////////////////


// Takes a ship object and renders it with all the relevant actions displayed (eg rockets firing)
function drawPlayerShip(ship) {

  push();
  translate(ship.pos.x, ship.pos.y);
  rotate(ship.rot);

  image(ship.sprite, 0, 0, 30, 30);
  if (ship.controlAccel > 0.1) {
    image(spriteFire, 0, 25);
  }

  pop();
}

function drawBullets(){
  for (let bullet of bullets) {
    if (bullet.active) {
      push();
      translate(bullet.position.x, bullet.position.y);
      rotate(bullet.velocity.heading()+90 );
      image(spriteBullet, 0, 0, 4, 10);
      pop();
    }
  }
}


// TODO: fix this
function drawStarfield(size) {
  // Set a fixed seed so that random numbers are consistent
  randomSeed(size);

  for (let i = 0; i < 250; i++) {
    let x = random(gameWidth - 10);
    let y = random(gameHeight - 10);
    let choice = floor(random(2));  // Choose either spriteStar1 or spriteStar2

    if (choice === 0) {
      image(spriteStar1, x, y, size, size);
    } else {
      image(spriteStar2, x, y, size+2, size+2);
    }
  }

}


// Draws rects around the edges of the game area so we can't see stuff rendered off there
function drawBlinders(){
  fill (30, 10, 10);
  rect(-10000, -10000, 20000, 10000);
  rect(-10000, -10000, 10000, 20000);
  rect(gameWidth, -10000, 20000, 20000);
  rect(-10000, gameHeight, 20000, 20000);
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


