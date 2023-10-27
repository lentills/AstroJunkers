
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

        this.isEnemy = false;   // Activates the AI
        this.shotCooldown = 0;  // Cooldown on each burst
        this.shotCount = 0;
        this.fireRate = 250;
    }

    update() {
        if (this.active) {
            this.position.add(p5.Vector.mult(this.velocity, deltaTime * 0.001));
            this.age += deltaTime;

            if (this.health <= 0) {
                this.destroy();
            }

            if (this.isEnemy) {

                // TODO: Better AI

                // Move toward the player
                var vecToPlayer = p5.Vector.sub(playerShip.pos, this.position);
                if (this.position.dist(playerShip.pos) < 300 && this.position.dist(playerShip.pos) > 150) {
                    vecToPlayer.setMag(40);
                    this.velocity = vecToPlayer.copy();
                } else {
                    this.velocity.mult(1 - deltaTime * 0.001);
                }

                // Fire at the player
                if (this.position.dist(playerShip.pos) < 300) {
                    this.shotCooldown += deltaTime;
                    if (this.shotCooldown > this.fireRate) {
                        if (this.shotCount < 3) {
                            this.shotCount++;
                            this.shotCooldown = 0;
                            if (this.shotCount > 0) {
                                vecToPlayer.setMag(500);
                                fireBullet(this.position.copy(), vecToPlayer, 0);
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

    create(pos, vel, weight, radius, health, sprite, isEnemy) {
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
        this.id = lastObstacleID;
    }

    deactivate() {
        this.active = false;
    }

    // Deactivates the obstacle/enemy but makes them explode!
    destroy() {

        this.deactivate();

        // TODO: explosion effect

        // If this is a big asteroid, split it into little ones
        if (this.weight > 60 && !this.isEnemy) {
            randomSeed(this.position.y);
            createObstacle(this.position.copy(), p5.Vector.add(this.velocity, createVector(random(-50, 0), random(-50, 80))), 30, 30, 20, 1, false);
            createObstacle(this.position.copy(), p5.Vector.add(this.velocity, createVector(random(-30, 30), random(-50, 50))), 30, 20, 30, 1, false);
        }

    }
}


// Find an inactive bullet and fire it
function createObstacle(pos, direction, weight, radius, health, sprite, isEnemy) {
    for (let obstacle of obstacles) {
        if (!obstacle.active) {
            obstacle.create(pos, direction, weight, radius, health, sprite, isEnemy);
            break;
        }
    }
}



function drawObstacles(obstacle) {
    for (let obstacle of obstacles) {
        if (obstacle.active) {
            push();
            translate(obstacle.position.x, obstacle.position.y);
            //rotate(obstacle.velocity.heading()+90 );
            image(obstacleSprites[obstacle.sprite], 0, 0, obstacle.radius, obstacle.radius);
            pop();
        }
    }
}


function loadObstacleSprites() {
    obstacleSprites.push(loadImage('assets/temp/meteorBrown_big1.png'));
    obstacleSprites.push(loadImage('assets/temp/meteorBrown_med3.png'));
    obstacleSprites.push(loadImage('assets/temp/ufoRed.png'));
}



