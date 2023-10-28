
var shotCooldown = 0;
var opponentShotCooldown = 0;
var wasFiringLastFrame = false; // Allows us to see if we have started or stopped firing

// Gets the player controls and applies them to the player ship
function getControls() {

    playerShip.controlAccel = 0;
    playerShip.controlRot = 0;

    if (keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW) || keyIsDown(87) && !keyIsDown(83)) {
        playerShip.controlAccel = characterStats[charID].acceleration;
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

    // Spacebar for firing guns
    if (keyIsDown(32) || mouseIsPressed) {
        playerShip.controlFire = true;
        if (!wasFiringLastFrame){
            reportPlayerFiring(true);
        }
    } else {
        playerShip.controlFire = false;
        if (wasFiringLastFrame){
            reportPlayerFiring(false);
        }
    }
    wasFiringLastFrame = playerShip.controlFire;

}


function moveShip(ship) {

    // Check the health here TODO: move somewhere else where it is better for multiplayer
    if (ship.health < 0){
        ship.health = characterStats[ship.character].health;
        ship.isCrashing = 2000;
    }

    // Ship is crashing, rotate the player a bunch
    if (ship.isCrashing > 0){
        ship.isCrashing -= deltaTime;
        ship.rotVel = 500;
    }

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

    if (ship.vel.mag() > characterStats[charID].maxSpeed) {
        ship.vel.mult(0.99);
    }

    // Fire bullets (TODO: bullet cooldown)
    if (ship.playerID == playerID){
        shotCooldown += deltaTime;
        if (ship.controlFire && shotCooldown > characterStats[charID].bulletRate) {
            //  shotCooldown = 0; // Shot cooldown set to zero in the draw function, so we can draw muzzle flash
            fireBullet(p5.Vector.add(ship.pos, p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), 20)), p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), characterStats[charID].bulletSpeed), ship.playerID);
        }
    }else{
        opponentShotCooldown += deltaTime;
        if (ship.controlFire && opponentShotCooldown > characterStats[charID].bulletRate) {
            //  shotCooldown = 0; // Shot cooldown set to zero in the draw function, so we can draw muzzle flash
            fireBullet(p5.Vector.add(ship.pos, p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), 20)), p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), characterStats[charID].bulletSpeed), ship.playerID);
        }
    }


}


// Check this player's collisions against any obstacles (asteroids, enemies, track etc)
function checkPlayerCollisions(ship){

    for (let obstacle of obstacles) {
        if (obstacle.active) {

            if (ship.pos.dist(obstacle.position) < obstacle.radius*0.5+10){

                // Crash!
                ship.health -= obstacle.weight;
                ship.vel.mult(0.3);
                ship.isCrashing = obstacle.weight*15;

                if (ship.playerID == playerShip.playerID){  // Only the local player destroys objects, and will send this data to the other player
                    obstacle.destroy();
                }

            }
        }
    }

    // Make sure the player is still on track, and if not apply a speed penalty
    if (checkMapCollision(0, ship.pos.x, ship.pos.y) == 0){
        ship.vel.mult(1 - (deltaTime * 0.001 * 5.0 ));
        //console.log("WHAT KIND OF A COLLISION?");
    }
}






// Takes a ship object and renders it with all the relevant actions displayed (eg rockets firing)
function drawPlayerShip(ship) {

    push();
    translate(ship.pos.x, ship.pos.y);
    rotate(ship.rot);

    image(ship.sprite, 0, 0, 30, 30);

    // Draw the rocket engine firing
    if (ship.controlAccel > 0.1) {
        image(spriteFire, 0, 25);
    }

    // Draw muzzle flash (TODO: different muzzle flash for each character?)
    if (ship.playerID == playerID){
        if (ship.controlFire && shotCooldown > characterStats[charID].bulletRate ) {
            image(spriteMuzzleFlash, 0, -15, 40, 40);
            shotCooldown = 0;
        }
    }else{
        if (ship.controlFire && opponentShotCooldown > characterStats[charID].bulletRate ) {
            image(spriteMuzzleFlash, 0, -15, 40, 40);
            opponentShotCooldown = 0;
        }
    }

    pop();
}

