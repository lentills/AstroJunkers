
const MAX_PARTICLES = 300;
let particles = [];

class Particle {
    constructor() {
        this.active = false;
        this.position = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.colour = [255, 255, 255, 255];
        this.lifespan = 0;
        this.size = 3;
    }

    update() {
        if (this.lifespan > 0) {
            this.position.add(p5.Vector.mult(this.velocity, deltaTime * 0.001));
            this.velocity.mult(1.0 - (0.5 * deltaTime * 0.001));
            this.lifespan -= deltaTime;
        } else {
            this.active = false;
        }
    }

    draw() {
        if (this.active) {
            noStroke();
            fill(color(this.colour[0], this.colour[1], this.colour[2], min(200, this.lifespan*2)));
            circle(this.position.x, this.position.y, this.size);
        }
    }

    fire(pos, vel, col, size, life){

        this.position = pos.copy();
        this.velocity = vel.copy();
        this.colour = col;
        this.active = true;
        this.lifespan = life;
        this.size = size;

    }

}


function drawParticles(){
    for (let particle of particles) {
        if (particle.active) {
            particle.draw();
        }
    }
}


function createParticle(pos, vel, col, size, lifespan){
    for (let particle of particles) {
        if (!particle.active) {
            particle.fire(pos, vel, col, size, lifespan);
            break;
        }
    }
}

// Creates a particle from the back of a ship, with the random angle spread
function createParticleExhaust(ship, spread, speed, lifespan, colour, size){

    randomSeed(ship.pos.x * 10000 + millis() + frameCount);

    var spawnVector = createVector(0, speed);
    spawnVector.rotate(ship.rot);
    spawnVector.rotate(random(-spread, spread));
    spawnVector.mult(random(0.8, 1.2));
    spawnVector.add(p5.Vector.mult(createVector(ship.vel.x, -ship.vel.y), 0.5));

    var newPos = p5.Vector.sub(ship.pos, p5.Vector.mult(createVector(sin(ship.rot), -cos(ship.rot)), 30));
    newPos.add(createVector(random(-spread/3, spread/3), random(-spread/3, spread/3)));

    createParticle(newPos, spawnVector, colour, size, lifespan);

}


function createParticleExplosion(pos, num, speed, lifespan, colour, size){

    randomSeed(frameCount);
    var spawnVector;

    for (var i=0;i<num;i++){
        spawnVector = createVector(0, speed);
        spawnVector.rotate(random(0, 360));
        spawnVector.mult(random(0.0, 1.2));

        createParticle(pos, spawnVector, colour, size, lifespan);
    }

}
