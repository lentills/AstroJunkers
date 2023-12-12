
// We are using an object pool for the bullets
// When a bullet hits something or lives too long it is deactivated, and can be re-initialised when a new bullet is fired


const MAX_BULLETS = 200;    // Number of bullets maximum. More bullets will take longer to resolve collisions
let bullets = [];

var spriteBullet = [];
var spriteMissile;


class Bullet {
    constructor() {
        this.active = false;
        this.position = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.age = 0;
        this.owner = 0;       // 0 - enemy bullet     1 - player1 bullet    2 -  player2 bullet
        this.character = -1;  // The character who shot the bullet
    }

    update() {
        if (this.active) {
            this.position.add(p5.Vector.mult(this.velocity, deltaTime * 0.001));
            this.age += deltaTime;

            if (this.age > 2000) {
                this.deactivate();    // Deactivate the bullet if it has lived too long without hitting anything
            }

        }
    }

    fire(pos, vel, owner) {
        this.active = true;
        this.position = pos.copy();
        this.velocity = vel.copy();
        this.age = 0;
        this.owner = owner;

        if (this.owner == playerID){
            this.character = playerShip.character;
        }else if (this.owner != 0){
            this.character = opponentShip.character;
        }

    }

    deactivate() {
        this.active = false;
    }
}

// Find an inactive bullet and fire it
function fireBullet(pos, direction, owner) {
    for (let bullet of bullets) {
        if (!bullet.active) {
            bullet.fire(pos, direction, owner);
            break;
        }
    }
}



// Draws all the active bullets in the pool
function drawBullets() {
    for (let bullet of bullets) {
        if (bullet.active) {
            push();
            translate(bullet.position.x, bullet.position.y);
            rotate(bullet.velocity.heading() + 90);

            if(bullet.owner == 0){
                image(spriteBullet[0], 0, 0, 10, 17);
            }else{
                switch (bullet.character){
                    case 0:
                        image(spriteBullet[1], 0, 0, 10, 17);
                        break;
                    case 1:
                        image(spriteBullet[2], 0, 0, 10, 17);
                        break;
                    case 2:
                        image(spriteBullet[3], 0, 0, 10, 17);
                        break;
                }
            }

            
            pop();
        }
    }
}


// Check this player's bullets collisions against any obstacles (asteroids, enemies etc)
function checkBulletCollisions() {

    for (let bullet of bullets) {

        // Check collisions with obstacles
        if (bullet.active && (bullet.owner == 1 || bullet.owner == 2)) {

            for (let obstacle of obstacles) {
                if (obstacle.active) {

                    if (bullet.position.dist(obstacle.position) < obstacle.radius * 0.5 && bullet.active) {

                        // Now only the host controls obstacles
                        if (playerID == 1){
                            obstacle.health -= 15;
                            obstacle.velocity.add(p5.Vector.mult(bullet.velocity, 1 / obstacle.weight));

                            if (bullet.character == 0){
                                obstacle.health -= 15;
                            }
                            
                        }

                        if (bullet.owner == playerID){
                            ultimateCharge += 500;
                        }
                        
                        obstacle.hit();
                        bullet.deactivate();
                        

                    }
                }
            }

            // Check collisions against other players (don't deduct health here, this is done on other player's end)
            if (multiplayer){
                if (bullet.position.dist(opponentShip.pos) < 20 && bullet.active) {
                    bullet.deactivate();
                    ultimateCharge += 1000;
                }
            }

            // Check collisions against boss
            for (let target of targets){
                if (target.active){
                    if (bullet.position.dist(target.position) < 45 && bullet.active) {
                        target.health -= 15;    // TODO: hit points based on character stats
                        target.hit();

                        // Check if the bullet was fired by hopper and skipp, and if so deduct more health
                        if (bullet.character == 0){
                            target.health -= 15;
                        }

                        if (bullet.owner == playerID) {
                            ultimateCharge += 300;
                        }
                        bullet.deactivate();
                    }
                }
            }

        }


        // Check enemy and opponent bullet collisions
        if (bullet.active && (bullet.owner == 0 || bullet.owner != playerShip.playerID)) {


            if (bullet.position.dist(playerShip.pos) < 20) {

                if (playerShip.invincibility < 3){

                    // Different health based on character
                    if (bullet.owner == 0 || !multiplayer){
                        playerShip.health -= 10;
                    }else{

                        if (opponentShip.character == 0){
                            playerShip.health -= 40;
                        }
    
                        if (opponentShip.character == 1){
                            playerShip.health -= 20;
                        }
    
                        if (opponentShip.character == 2){
                            playerShip.health -= 20;
                        }
    
                        if (opponentShip.character == 2){
                            playerShip.health -= 10;        // Yasmin does less bullet damage while ulting, cos that's a little nuts
                        }

                    }


                    
                }

                // Getting hit gives you alt charge, why not lmao
                if (bullet.owner != playerID){
                    ultimateCharge += 300;
                }

                bullet.deactivate();

                soundManager.play('impact');
            }

        }

    }

}



// Does Nyx's ultimate
function ultimateNyx(playerUlt) {

    if (playerUlt == playerID) {
        addExplosion(playerShip.pos.x, playerShip.pos.y, 800, explosionFrames);
        // Loop through enemies and obstacles and apply massive damage
        for (let obstacle of obstacles) {
            if (obstacle.active) {
                if (playerShip.pos.dist(obstacle.position) < 500) {
                    obstacle.hit();
                    obstacle.health -= floor((500 - playerShip.pos.dist(obstacle.position)) / 3);
                }
            }
        }
        // Loop through enemies and obstacles and apply massive damage
        for (let target of targets) {
            if (target.active) {
                if (playerShip.pos.dist(target.position) < 500) {
                    target.hit();
                    target.health -= floor((500 - playerShip.pos.dist(target.position)) / 3);
                }
            }
        }
    } else {
        addExplosion(opponentShip.pos.x, opponentShip.pos.y, 800, explosionFrames);
        // Damage us, since we are caught in the ult
        if (playerShip.pos.dist(opponentShip.pos) < 500) {
            playerShip.health -= floor((500 - playerShip.pos.dist(opponentShip.pos)) / 4);
        }
        // Loop through enemies and obstacles and apply massive damage
        for (let obstacle of obstacles) {
            if (obstacle.active) {
                if (opponentShip.pos.dist(obstacle.position) < 500) {
                    obstacle.hit();
                    obstacle.health -= floor((500 - opponentShip.pos.dist(obstacle.position)) / 3);
                }
            }
        }
    }

    soundManager.play('emp');

}



var friendlyMissilePos, friendlyMissileActive;
var enemyMissilePos, enemyMissileActive;
function ultimateHopperSkipp(playerUlt){

    // Set the relevant missile active and initialise it's possition
    if (playerUlt == playerID || !multiplayer){
        friendlyMissilePos = playerShip.pos.copy();
        friendlyMissileActive = true;
    }else{
        enemyMissilePos = opponentShip.pos.copy();
        enemyMissileActive = true;
    }

}

function doMissiles(){

    if (multiplayer){

        if (friendlyMissileActive){
            var vecToPlayer = p5.Vector.sub(opponentShip.pos, friendlyMissilePos);
            vecToPlayer.setMag(deltaTime*1.5);
            friendlyMissilePos.add(vecToPlayer);

            push();
            translate(friendlyMissilePos.x, friendlyMissilePos.y);
            rotate(vecToPlayer.heading() + 90);
            image(spriteMissile, 0, 0, 100, 100);
            pop();

            // Opponent got hit!
            if (friendlyMissilePos.dist(opponentShip.pos) < 60){
                friendlyMissileActive = false;
                addExplosion(friendlyMissilePos.x, friendlyMissilePos.y, 300, explosionFrames);
            }


        }

        if (enemyMissileActive){
            var vecToPlayer = p5.Vector.sub(playerShip.pos, enemyMissilePos);
            vecToPlayer.setMag(deltaTime*1.5);
            enemyMissilePos.add(vecToPlayer);
            
            push();
            translate(enemyMissilePos.x, enemyMissilePos.y);
            rotate(vecToPlayer.heading() + 90);
            image(spriteMissile, 0, 0, 100, 100);
            pop();

            // We got hit!
            if (enemyMissilePos.dist(playerShip.pos) < 60){
                enemyMissileActive = false;
                addExplosion(enemyMissilePos.x, enemyMissilePos.y, 300, explosionFrames);
                playerShip.health -= 200;
            }

        }

    }else if (friendlyMissileActive){

        // In singleplayer, the rocket chases the nearest obstacle
        var nearestObstacle;
        var nearestDistance = 10000000;

        for (let obstacle of obstacles){
            if (obstacle.active){
                if (playerShip.pos.dist(obstacle.position) < nearestDistance){
                    nearestDistance = playerShip.pos.dist(obstacle.position);
                    nearestObstacle = obstacle;
                }
            }
        }

        if (nearestDistance < 10000000){ // Meaning we found an obstacle to shoot at

            var vecToObstacle = p5.Vector.sub(nearestObstacle.position, friendlyMissilePos);
            vecToObstacle.setMag(deltaTime*1.5);
            friendlyMissilePos.add(vecToObstacle);
    
            push();
            translate(friendlyMissilePos.x, friendlyMissilePos.y);
            rotate(vecToObstacle.heading() + 90);
            image(spriteMissile, 0, 0, 100, 100);
            pop();
    
            // Opponent got hit!
            if (friendlyMissilePos.dist(nearestObstacle.position) < 60 || !nearestObstacle.active){
                friendlyMissileActive = false;
                addExplosion(friendlyMissilePos.x, friendlyMissilePos.y, 300, explosionFrames);
                nearestObstacle.health -= 200;
            }
        }
        

    }

}


function loadBulletSprites(){

    spriteBullet.push(loadImage('assets/bulletEnemy.png'));
    spriteBullet.push(loadImage('assets/bulletHopperSkipp.png'));
    spriteBullet.push(loadImage('assets/bulletNyx.png'));
    spriteBullet.push(loadImage('assets/bulletYasmin.png'));

    spriteMissile = loadImage('assets/bulletNyx.png');

}
