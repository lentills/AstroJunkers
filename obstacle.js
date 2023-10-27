
// We are using another object pool for obstacles in the game
// These can include asteroids, debris etc.
// TODO: Can also be enemies, with the isEnemy flag. Enables movement, AI and fighting
// TODO: rotation and basic physics

const MAX_OBSTACLES = 50;  // Max number of obstacles. More obstacles takes longer to resolve collisions
let obstacles = [];

let obstacleSprites = [];

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
    }

    update() {
        if (this.active) {
            this.position.add(this.velocity);
            this.age += deltaTime;

            if (this.health <= 0) {
                this.destroy();
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
    }

    deactivate() {
        this.active = false;
    }

    // Deactivates the obstacle/enemy but makes them explode!
    destroy() {

        this.deactivate();

        // TODO: explosion effect

        // If this is a big asteroid, split it into little ones
        if (this.weight > 60 && !this.isEnemy){
            createObstacle(this.position.copy(), p5.Vector.add(this.velocity, createVector(-0.4, 0.7)), 30, 30, 20, 1);
            createObstacle(this.position.copy(), p5.Vector.add(this.velocity, createVector(0.2, -0.5)), 30, 20, 30, 1);
        }

    }
}


// Find an inactive bullet and fire it
function createObstacle(pos, direction, weight, radius, health, sprite) {
    for (let obstacle of obstacles) {
        if (!obstacle.active) {
            obstacle.create(pos, direction, weight, radius, health, sprite);
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


function loadObstacleSprites(){
    obstacleSprites.push(loadImage('assets/temp/meteorBrown_big1.png'));
    obstacleSprites.push(loadImage('assets/temp/meteorBrown_med3.png'));
}



