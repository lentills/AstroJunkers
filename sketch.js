

// Assets
let spriteShip, spriteFire, spriteStar1, spriteStar2;

// Character stats
var charID = 0;   // Which character the player has selected
const characterStats = 
  [
    {maxSpeed:350, acceleration:300, deceleration:80, maxRotSpeed:300, rotAcceleration:800, forwardsFriction:0.2, sidewaysFriction:0.3}
  ];

// Utilities
var gameWidth = 1600;
var gameHeight = 900;
var cameraAgility = 1;
var cameraPos, cameraVel;

// Game state
var playerShip;



function preload() {
  spriteShip = loadImage('assets/temp/playerShip3_blue.png');
  spriteFire = loadImage('assets/temp/fire14.png');
  spriteStar1 = loadImage('assets/temp/star1.png');
  spriteStar2 = loadImage('assets/temp/star2.png');
}



function setup() {
  frameRate(60);
  createCanvas(windowWidth, windowHeight);
  calculateScale();

  // Setup player
  angleMode(DEGREES);
  imageMode(CENTER)
  playerShip = { character: 0, pos: createVector(800, 800), rot: 0, rotVel: 0, vel: createVector(0, 0), sprite: spriteShip, controlAccel: 0, controlRot: 0 };
  cameraPos = playerShip.pos.copy();
  cameraVel = playerShip.vel.copy();
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

  //drawStarfield();


  // Do the timestep
  doTimeStep();


  // Move the camera
  push();
  translate(-cameraPos.x + gameWidth/2, -cameraPos.y + gameHeight/2);
  moveCameraDamped();

  drawStarfield();

  // Draw player (temp)
  drawPlayerShip(playerShip);


  pop();

  drawBlinders();

  pop();
}










////////////////
// GAME FUNCS //
////////////////


// Gets the player controls and applies them to the player ship
function getControls() {

  playerShip.controlAccel = 0;
  playerShip.controlRot = 0;

  if (keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW)) {
    playerShip.controlAccel = characterStats[charID].acceleration;  // TODO: update these values to the individual ships stats
  }

  if (keyIsDown(DOWN_ARROW) && !keyIsDown(UP_ARROW)) {
    playerShip.controlAccel = -characterStats[charID].deceleration;
  }

  if (keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
    playerShip.controlRot = -characterStats[charID].rotAcceleration;
  }

  if (keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW)) {
    playerShip.controlRot = characterStats[charID].rotAcceleration;
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
    ship.rotVel -= 30 * deltaTime * 0.001;
  }
  if (ship.rotVel < -1) {
    ship.rotVel += 30 * deltaTime * 0.001;
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

}



function moveCameraDamped() {
  let dampeningFactor = 0.5;
  cameraVel.lerp(playerShip.vel, 1 - dampeningFactor);
  
  let offset = createVector(cameraVel.x * 0.5, -cameraVel.y * 0.5);
  let targetPoint = p5.Vector.add(playerShip.pos, offset);

  //fill(255, 0, 0);
  //rect(targetPoint.x, targetPoint.y, 5, 5);

  // 2. Easing
  let ease = (t) => t * t * (3 - 2 * t);  // Simple easeInOut function. You can replace with other easing functions.
  let easedAgility = ease(cameraAgility * deltaTime * 0.01);
  cameraPos.lerp(targetPoint, easedAgility);
  //cameraPos = playerShip.pos.copy();
}



function doTimeStep() {

  getControls();
  moveShip(playerShip);

}






////////////////////
// GRAPHICS FUNCS //
////////////////////


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


// TODO: fix this
function drawStarfield() {
  // Set a fixed seed so that random numbers are consistent
  randomSeed(99);

  for (let i = 0; i < 250; i++) {
    let x = random(gameWidth - 10);
    let y = random(gameHeight - 10);
    let choice = floor(random(2));  // Choose either spriteStar1 or spriteStar2

    if (choice === 0) {
      image(spriteStar1, x, y, 5, 5);
    } else {
      image(spriteStar2, x, y, 7, 7);
    }
  }

}

// Draws rects around the edges of the game area so we can't see stuff rendered off there
function drawBlinders(){
  fill (0);
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


