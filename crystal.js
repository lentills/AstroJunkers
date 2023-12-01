

const MAX_CRYSTALS = 150;    // Number of energy crystals maximum. More will take longer to resolve collisions
let crystals = [];


class Crystal {

    constructor() {
        this.active = false;
        this.position = createVector(0, 0);
        this.velocity = createVector(0, 0);
    }

    update() {
        if (this.active) {
            this.position.add(p5.Vector.mult(this.velocity, deltaTime * 0.001));
            this.velocity.mult(1.0 - (3.0 * deltaTime * 0.001));
        }
    }

    create(pos, vel) {
        this.active = true;
        this.position = pos.copy();
        this.velocity = vel.copy();
    }

    deactivate() {
        this.active = false;
    }

}

function createCrystal(pos, vel){
    for (let crystal of crystals) {
        if (!crystal.active) {
            crystal.create(pos, vel);
            break;
        }
    }
}

// Find an inactive bullet and fire it
function createCrystalBurst(num, pos, speed, spread) {

    for (var i=0;i<num;i++){
        var spawnVector = createVector(0, speed);
        spawnVector.rotate(random(-spread, spread));
        spawnVector.mult(random(0.5, 1.5));
        createCrystal(pos, spawnVector);
    }

}



// Draws all the active bullets in the pool
function drawCrystals() {
    for (let crystal of crystals) {
        if (crystal.active) {
            image(spriteBullet, crystal.position.x, crystal.position.y, 4, 6);
        }
    }
}


