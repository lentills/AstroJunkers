

const MAX_CRYSTALS = 300;    // Number of energy crystals maximum. More will take longer to resolve collisions
let crystals = [];


class Crystal {

    constructor() {
        this.active = false;
        this.position = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.age = 0;
    }

    update() {
        if (this.active) {
            this.age += deltaTime;
            this.position.add(p5.Vector.mult(this.velocity, deltaTime * 0.001));
            this.velocity.mult(1.0 - (3.0 * deltaTime * 0.001));

            // Be sucked towards nearby players
            var closestVec = playerShip.pos.copy();
            if (multiplayer){
                if (this.position.dist(playerShip.pos) > this.position.dist(opponentShip.pos)) {
                    closestVec = opponentShip.pos.copy();
                }
            }
            
            var vecToPlayer = p5.Vector.sub(closestVec, this.position);
            if (this.position.dist(closestVec) < 40 && this.age > 1000) {
                vecToPlayer.setMag(1200);
                this.velocity.lerp(vecToPlayer, deltaTime * 0.001 * 3.0);
            }

        }
    }

    create(pos, vel) {
        this.active = true;
        this.position = pos.copy();
        this.velocity = vel.copy();
        this.age = 0;
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


