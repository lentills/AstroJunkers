
// We are using an object pool for the bullets
// When a bullet hits something or lives too long it is deactivated, and can be re-initialised when a new bullet is fired


const MAX_BULLETS = 100;    // Number of bullets maximum. More bullets will take longer to resolve collisions
let bullets = [];


class Bullet {
    constructor() {
        this.active = false;
        this.position = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.age = 0;
        this.owner = 0;       // 0 - enemy bullet     1 - player1 bullet    2 -  player2 bullet
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
            image(spriteBullet, 0, 0, 4, 10);
            pop();
        }
    }
}


// Check this player's bullets collisions against any obstacles (asteroids, enemies etc)
function checkBulletCollisions() {

    for (let bullet of bullets) {

        // Check collisions with obstacles
        if (bullet.active && bullet.owner == 1 || bullet.owner == 2) {

            for (let obstacle of obstacles) {
                if (obstacle.active) {

                    if (bullet.position.dist(obstacle.position) < obstacle.radius * 0.5) {

                        /*if (bullet.owner == playerID){  // Only affect objects if this is our bullet - otherwise the other player handles this
                            obstacle.health -= 15;
                            obstacle.hit();
                            obstacle.velocity.add(p5.Vector.mult(bullet.velocity, 1 / obstacle.weight));
                        }*/

                        // Now only the host controls obstacles
                        if (playerID == 1){
                            obstacle.health -= 15;
                            obstacle.velocity.add(p5.Vector.mult(bullet.velocity, 1 / obstacle.weight));
                        }
                        
                        obstacle.hit();
                        bullet.deactivate();

                    }
                }
            }

            // Check collisions against other players (don't deduct health here, this is done on other player's end)
            if (multiplayer){
                if (bullet.position.dist(opponentShip.pos) < 20) {
                    bullet.deactivate();
                }
            }

            // Check collisions against boss
            for (let target of targets){
                if (target.active){
                    if (bullet.position.dist(target.position) < 45) {
                        target.health -= 15;    // TODO: hit points based on character stats
                        target.hit();
                        bullet.deactivate();
                    }
                }
            }

        }


        // Check enemy and opponent bullet collisions
        if (bullet.active && (bullet.owner == 0 || bullet.owner != playerShip.playerID)) {

            if (bullet.position.dist(playerShip.pos) < 20) {
                playerShip.health -= 10;
                bullet.deactivate();
            }

        }

    }

}