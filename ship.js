
var shotCooldown = 0;
var healthRechargeCooldown = 0;
var opponentShotCooldown = 0;
var ultimateCharge = 0;
var wasFiringLastFrame = false; // Allows us to see if we have started or stopped firing

// Gets the player controls and applies them to the player ship
function getControls() {

    playerShip.controlAccel = 0;
    playerShip.controlRot = 0;

    if (keyIsDown(UP_ARROW) && !keyIsDown(DOWN_ARROW) || keyIsDown(87) && !keyIsDown(83)) {
        playerShip.controlAccel = characterStats[playerShip.character].acceleration;
    }

    if (keyIsDown(DOWN_ARROW) && !keyIsDown(UP_ARROW) || keyIsDown(83) && !keyIsDown(87)) {
        playerShip.controlAccel = -characterStats[playerShip.character].deceleration;
    }

    if (keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW) || keyIsDown(65) && !keyIsDown(68)) {
        playerShip.controlRot = -characterStats[playerShip.character].rotAcceleration;
    }

    if (keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW) || keyIsDown(68) && !keyIsDown(65)) {
        playerShip.controlRot = characterStats[playerShip.character].rotAcceleration;
    }

    // Check to see if we are at the start of the game in the countdown period
    if (startGameCountdown > 0){
        playerShip.controlAccel = 0;
        playerShip.controlRot = 0;
        startGameCountdown -= deltaTime;
    }

    // Using ultimate
    if (keyIsDown(81) || keyIsDown(SHIFT)){
        if (ultimateCharge >= 100000-10){

            ultimateCharge = 0;

            // Hopper and Skipp's ultimate
            if (playerShip.character == 0){
                playerShip.ultimate = 2000;    // Hopper and Skipp's ult is the homing missile
                reportUltimate(0, 2000);
                ultimateHopperSkipp(playerID);
            }

            // Nyx's ultimate
            if (playerShip.character == 1){
                playerShip.ultimate = 1200;    // Nyx's ult is the EMP burst, still set this to a number for the HUD facial expressions
                reportUltimate(1, 1);
                ultimateNyx(playerID);
            }

            //Yasmin's ultimate
            if (playerShip.character == 2){
                playerShip.ultimate = 4000; // Yasmin's ult is super fast gun for 5 seconds
                reportUltimate(2, 4000);
            }

        }
    }

    // Spacebar for firing guns
    if (keyIsDown(32) || mouseIsPressed) {
        if (!wasFiringLastFrame && playerShip.fireCooldown > 0){
            reportPlayerFiring(true);
            playerShip.controlFire = true;
        }
    } else {
        playerShip.controlFire = false;
        if (wasFiringLastFrame){
            reportPlayerFiring(false);
        }
    }

    // Handle fire cooldown with reporting multiplayer
    if (wasFiringLastFrame && playerShip.fireCooldown < 0){
        reportPlayerFiring(false);
        playerShip.controlFire = false;
        wasFiringLastFrame = false;
    }
    if (playerShip.fireCooldown > 0){
        wasFiringLastFrame = playerShip.controlFire;
    }else{
        wasFiringLastFrame = false;
    }

}


function moveShip(ship) {

    // Check the health here TODO: move somewhere else where it is better for multiplayer
    if (ship.health < 1){
        ship.health = characterStats[ship.character].health;
        ship.isCrashing = 2000;
        ship.invincibility = 2000;

        // Release a bunch of our precious crystals on crash
        if(playerID == ship.playerID){
            createCrystalBurst(floor(ship.score * 0.8), ship.pos, 300, 360);
            ship.score -= floor(ship.score * 0.8);
        }
    }

    // Ship is crashing, rotate the player a bunch
    if (ship.isCrashing > 0){
        ship.isCrashing -= deltaTime;
        ship.rotVel = 500;
    }

    if (ship.ultimate > 0){
        ship.ultimate -= deltaTime;
    }

    // Rotate the player
    ship.rotVel += ship.controlRot * deltaTime * 0.001
    ship.rot += ship.rotVel * deltaTime * 0.001;

    // Add the acceleration to the players ship
    ship.vel.add(createVector(0, ship.controlAccel).rotate(-ship.rot).mult(deltaTime * 0.001));

    // Move the player
    ship.pos.add(ship.vel.x * deltaTime * 0.001, -ship.vel.y * deltaTime * 0.001);


    // Apply friction to rotation
    ship.rotVel = min(max(ship.rotVel, -characterStats[ship.character].maxRotSpeed), characterStats[ship.character].maxRotSpeed);
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
    var frictionForce = sidewaysComponent.mult(sidewaysVelocity * deltaTime * 0.001 * characterStats[ship.character].sidewaysFriction);
    ship.vel.sub(frictionForce);
    ship.vel.mult(1 - (deltaTime * 0.001 * characterStats[ship.character].forwardsFriction));   // Forwards friction multiplier 0.5

    if (ship.vel.mag() > characterStats[ship.character].maxSpeed) {
        ship.vel.mult(0.99);
    }

    // Fire bullets
    if (ship.playerID == playerID){

        // Shot cooldown
        shotCooldown += deltaTime;
        // If Yasmin is ulting then speedup cooldown
        if (playerShip.character == 2 && playerShip.ultimate > 0){
            shotCooldown += deltaTime*2;
        }

        if ((playerShip.character == 2 && playerShip.ultimate > 0) || (ship.controlFire && shotCooldown > characterStats[ship.character].bulletRate && ship.fireCooldown > 0)) {
            //  shotCooldown = 0; // Shot cooldown set to zero in the draw function, so we can draw muzzle flash
            fireBullet(p5.Vector.add(ship.pos, p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), 20)), p5.Vector.add(p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), characterStats[ship.character].bulletSpeed), createVector(ship.vel.x, -ship.vel.y)), ship.playerID);

            if (playerShip.character != 2 || playerShip.ultimate < 1){
                ship.fireCooldown -= characterStats[ship.character].bulletRate * 2;

                // Hopper and skipp have a slower fire cooldown
                if (playerShip.character == 0){
                    ship.fireCooldown += characterStats[ship.character].bulletRate/3;
                }

                // Penalise firing the last bullet without recharging
                if (ship.fireCooldown < 0){
                    ship.fireCooldown = -500;
                }
            }

        }
    }else{
        opponentShotCooldown += deltaTime;
        if ((opponentShip.character == 2 && opponentShip.ultimate > 0) || (ship.controlFire && opponentShotCooldown > characterStats[ship.character].bulletRate)) {
            //  shotCooldown = 0; // Shot cooldown set to zero in the draw function, so we can draw muzzle flash
            fireBullet(p5.Vector.add(ship.pos, p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), 20)), p5.Vector.add(p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), characterStats[ship.character].bulletSpeed), createVector(ship.vel.x, -ship.vel.y)), ship.playerID);
        }
    }

    // Control the invincibility cooldown after losing all healths
    if (ship.invincibility > 0){
        ship.invincibility -= deltaTime;
        if (ship.invincibility < 0){
            ship.invincibility = 0;
        }
    }

    // Health replenishes very slowly
    if (ship.health < characterStats[ship.character].health && healthRechargeCooldown > 600 && ship.playerID == playerID){
        healthRechargeCooldown = 0;
        ship.health ++;
    }
    healthRechargeCooldown += deltaTime;

    // Fire cooldown replenishes
    if (ship.fireCooldown < 3000){
        ship.fireCooldown += floor(deltaTime);
    }

    // Check for end of the race
    if (ship.pos.y < -mapHeight*tileSize && gameInSession == 1){
        gameInSession = -1;
        addExplosion(ship.pos.x, ship.pos.y, 100, explosionFrames);
        soundManager.sounds['music2'].fadeOut(4);
    }

    ultimateCharge = max(min(ultimateCharge + deltaTime*10, 100000), 0);

}


// Check this player's collisions against any obstacles (asteroids, enemies, track etc)
function checkPlayerCollisions(ship){

    for (let obstacle of obstacles) {
        if (obstacle.active) {

            if (ship.pos.dist(obstacle.position) < obstacle.radius*0.5+10){

                // Crash!
                if (playerShip.invincibility < 3){
                    ship.health -= obstacle.weight;
                }
                ship.vel.mult(0.3);
                ship.isCrashing = obstacle.weight*15;

                if (ship.playerID == playerShip.playerID){  // Only the local player destroys objects, and will send this data to the other player
                    ship.vel = p5.Vector.mult(createVector(p5.Vector.sub(ship.pos, obstacle.position).x, -p5.Vector.sub(ship.pos, obstacle.position.y)), 5);
                    if (obstacle.isEnemy){
                        obstacle.health -= 40;
                    }else{
                        obstacle.destroy();
                        reportDestroyObstacle(obstacle.id, true);
                    }
                }

            }
        }
    }

    // Make sure the player is still on track, and if not apply a speed penalty
    if (checkMapCollision(0, ship.pos.x, ship.pos.y) == 0){
        ship.vel.mult(1 - (deltaTime * 0.001 * 5.0 ));
        //console.log("WHAT KOIND OF A COLLISION?");
    }

    // Check to see if we are crashing into the boss, and bounce off
    if (bossAlive && ship.pos.y < -BOSS_POSITION*tileSize+130){
        ship.vel.y = -250;
        ship.pos.y = -BOSS_POSITION*tileSize+140;
        if (playerShip.invincibility < 3){
            ship.health -= 40;
        }
        ship.isCrashing = 300;
    }

    // Check if we are touching any crystals
    if (ship.playerID == playerID){
        for (let crystal of crystals) {
            if (crystal.active && crystal.age > 1000 && crystal.position.dist(ship.pos) < 15) {
                ship.score += 1;
                if (multiplayer){
                    reportDestroyCrystal(crystal.id);
                }
                crystal.deactivate();
            }
        }
    }


}






// Takes a ship object and renders it with all the relevant actions displayed (eg rockets firing)
function drawPlayerShip(ship) {

    push();
    translate(ship.pos.x, ship.pos.y);
    rotate(ship.rot);

    image(ship.sprite, 0, 0, 50, 50);

    // Draw the rocket engine firing
    if (ship.controlAccel > 0.1) {
        switch (ship.character){
            case 0:
                image(spriteFire[0], 0, 32, 40, 40);
                createParticleExhaust(ship, 10, 400, 150, [255, 200, 155], 1.5);
                break;
            case 1:
                image(spriteFire[1], 0, 32, 40, 40);
                createParticleExhaust(ship, 6, 450, 130, [255, 160, 175], 1.5);
                break;
            case 2:
                image(spriteFire[2], 0, 32, 40, 40);
                break;
        }
        soundManager.sounds['engine'].unmute(slider2.value());
    }else{
        soundManager.sounds['engine'].mute();
    }

    // Draw muzzle flash
    if (ship.playerID == playerID ){
        if ((ship.character == 2 && ship.ultimate > 0) || ship.controlFire && shotCooldown > characterStats[ship.character].bulletRate ) {
            image(spriteMuzzleFlash[Math.floor(Math.random() * spriteMuzzleFlash.length)], 0, -15, 40, 40);

            if (ship.character == 0) {
                soundManager.play('laserStrong');
            }

            if (ship.character == 1) {
                soundManager.play('laser');
            }

            if (ship.character == 2) {
                if (ship.ultimate > 0){
                    soundManager.play('laserDeepLow');
                }else{
                    soundManager.play('laserDeep');
                }
                
            }
            
            shotCooldown = 0;
        }
    }else{
        if ((ship.character == 2 && ship.ultimate > 0) || ship.controlFire && opponentShotCooldown > characterStats[ship.character].bulletRate) {
            image(spriteMuzzleFlash[floor(random()*spriteMuzzleFlash.length)], 0, -15, 40, 40);

            if (ship.character == 0) {
                soundManager.sounds['laserStrong'].setVolume(slider2.value() * 0.7);
                soundManager.play('laserStrong');
            }

            if (ship.character == 1) {
                soundManager.sounds['laser'].setVolume(slider2.value() * 0.7);
                soundManager.play('laser');
            }

            if (ship.character == 2) {
                soundManager.sounds['laserDeep'].setVolume(slider2.value() * 0.7);
                soundManager.play('laserDeep');
            }

            opponentShotCooldown = 0;
        }
    }

    pop();
}


// Draws the health bar for the given ship
function drawHealthBar(ship){
    // TODO: replace with graphics
    fill(230);
    rect (1600 - 400, 900 - 100, 300, 15);

    if (ship.invincibility > 0){
        fill (150, 10, 110);
        rect (1600 - 400, 900 - 100, 300 * ((2000-ship.invincibility)/2000), 15);
    }else{
        fill (230, 30, 60);
        rect (1600 - 400, 900 - 100, 300 * (max(ship.health, 0) / characterStats[ship.character].health), 15);
    }

}


// Draws the cooldown bar under the health bar
function drawCooldown(ship){
    // TODO: replace with graphics
    fill(230);
    rect (1600 - 400, 900 - 60, 300, 15);
    fill (50, 110, 155);
    rect (1600 - 400, 900 - 60, 300 * (max(ship.fireCooldown, 0) / 3000), 15);
}


function drawUltimateBar(){
    // TODO: replace with graphics
    fill(230);
    rect (100, 900 - 80, 300, 25);
    fill (70, 160, 130);
    rect (100, 900 - 80, 300 * (max(ultimateCharge, 0) / 100000), 25);
}

function drawScore(ship){
    fill(0, 250, 250, 250);
    textSize(40);
    textAlign(CENTER, CENTER);
    text(ship.score, 800, 850);
}
