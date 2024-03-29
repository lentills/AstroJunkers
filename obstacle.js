
// We are using another object pool for obstacles in the game
// These can include asteroids, debris etc.
// TODO: Can also be enemies, with the isEnemy flag. Enables movement, AI and fighting
// TODO: rotation and basic physics

const MAX_OBSTACLES = 50;  // Max number of obstacles. More obstacles takes longer to resolve collisions
let obstacles = [];

let obstacleSprites = [];

var lastObstacleID = 0;

class Obstacle {

    constructor() {
        this.id = -1;   // ID of the obstacle, allows us to communicate information about each obstacle between players
        this.active = false;
        this.position = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.age = 0;
        this.health = 100;
        this.weight = 100;      // Weight of the object, determines how much damage a collision causes
        this.radius = 100;      // Radius of hitbox
        this.sprite = null;

        this.needsUpdate = 0;    // 0 if we need to send an update about this object, set to 1000 after update. set to 0 if state changed (eg hit by bullet)

        this.isEnemy = false;   // Activates the AI
        this.shotCooldown = 0;  // Cooldown on each burst
        this.shotCount = 0;
        this.fireRate = 250;
        this.hitEffect = 0;     // Make the object glow for a couple frames on hit
    }

    update() {
        if (this.active) {
            this.position.add(p5.Vector.mult(this.velocity, deltaTime * 0.001));
            this.age += deltaTime;
            this.needsUpdate = max(this.needsUpdate-deltaTime, 0);

            if (this.health < 0) {
                reportDestroyObstacle(this.id, true);
                this.destroy();
            }

            if (this.isEnemy) {

                // TODO: Better AI

                // Move toward the player
                var closestVec = playerShip.pos.copy();
                if (multiplayer){
                    if (this.position.dist(playerShip.pos) > this.position.dist(opponentShip.pos)) {
                        closestVec = opponentShip.pos.copy();
                    }
                }
                
                var vecToPlayer = p5.Vector.sub(closestVec, this.position);
                if (this.position.dist(closestVec) < 500 && this.position.dist(closestVec) > 150) {
                    vecToPlayer.setMag(40);
                    this.velocity = vecToPlayer.copy();
                } else {
                    this.velocity.mult(1 - deltaTime * 0.001);
                }

                // Fire at the player
                if (this.position.dist(closestVec) < 300) {
                    this.shotCooldown += deltaTime;
                    if (this.shotCooldown > this.fireRate) {
                        if (this.shotCount < 3) {
                            this.shotCount++;
                            this.shotCooldown = 0;
                            if (this.shotCount > 0) {
                                vecToPlayer.setMag(500);
                                fireBullet(this.position.copy(), vecToPlayer, 0);
                                soundManager.sounds['laserDeep'].setVolume(slider2.value() * 0.7);
                                soundManager.play('laserDeep');
                            }
                        } else {
                            this.shotCount = -3;
                            this.shotCooldown = 0;
                        }
                    }
                }

            }

        }
    }

    create(id, pos, vel, weight, radius, health, sprite, isEnemy, fireRate) {
        this.active = true;
        this.position = pos.copy();
        this.velocity = vel.copy();
        this.age = 0;
        this.health = health;
        this.weight = weight;
        this.radius = radius;
        this.sprite = sprite;
        this.isEnemy = isEnemy;
        lastObstacleID++;
        this.id = id;
        this.fireRate = fireRate;
        this.shotCooldown = 0;  // Cooldown on each burst
        this.shotCount = 0;
        this.needsUpdate = true;
    }

    hit(){
        this.hitEffect = 2;
    }

    deactivate() {
        this.active = false;
    }

    // Deactivates the obstacle/enemy but makes them explode!
    destroy() {

        if (this.active) {
            this.deactivate();

            if (this.radius > 30){
                soundManager.play('explosionSmall');
            }

            addExplosion(this.position.x, this.position.y, this.radius*3, explosionFrames);

            // If this is a big asteroid, split it into little ones
            if (this.weight > 60 && !this.isEnemy && playerID == 1) {
                randomSeed(this.position.y);
                createObstacle(-1, this.position.copy(), p5.Vector.add(this.velocity, createVector(random(-50, 0), random(-50, 80))), 30, 30, 20, 3, false, 0);
                createObstacle(-1, this.position.copy(), p5.Vector.add(this.velocity, createVector(random(-30, 30), random(-50, 50))), 30, 20, 20, 3, false, 0);
            }
        }

    }
}


// Find an inactive obstacle and create it
// Set id to -1 to automatically assign a free id
function createObstacle(id, pos, direction, weight, radius, health, sprite, isEnemy, fireRate) {

    if (id == -1) {
        id = lastObstacleID;
    }
    if (lastObstacleID < id) {
        lastObstacleID = id;
    }
    for (let obstacle of obstacles) {
        if (!obstacle.active) {
            obstacle.create(id, pos, direction, weight, radius, health, sprite, isEnemy, fireRate);
            // If we are the main player, report that we created this
            if (playerID == 1) {
                reportObstacle(obstacle);
            }
            break;
        }
    }



}



function drawObstacles() {
    for (let obstacle of obstacles) {
        if (obstacle.active) {
            push();
            translate(obstacle.position.x, obstacle.position.y);
            //rotate(obstacle.velocity.heading()+90 );
            if (obstacle.hitEffect > 0){
                obstacle.hitEffect --;
                tint(255, 80, 0);
            }
            image(obstacleSprites[obstacle.sprite], 0, 0, obstacle.radius, obstacle.radius);
            pop();
        }
    }
}


function loadObstacleSprites() {
    obstacleSprites.push(loadImage('assets/asteroid_1.png'));
    obstacleSprites.push(loadImage('assets/asteroid_2.png'));
    obstacleSprites.push(loadImage('assets/asteroid_3.png'));
    obstacleSprites.push(loadImage('assets/asteroid_4.png'));
    obstacleSprites.push(loadImage('assets/ufo.png'));
}



