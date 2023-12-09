

const MAX_CRYSTALS = 300;    // Number of energy crystals maximum. More will take longer to resolve collisions
let crystals = [];


class Crystal {

    constructor() {
        this.active = false;
        this.position = createVector(0, 0);
        this.velocity = createVector(0, 0);
        this.age = 0;
        this.id = -1;
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
            if (this.position.dist(closestVec) < 50 && this.age > 1000) {
                vecToPlayer.setMag((50-this.position.dist(closestVec))*40 + 500);
                this.velocity.lerp(vecToPlayer, deltaTime * 0.001 * 3.0);
            }

        }
    }

    create(pos, vel, id) {
        this.active = true;
        this.position = pos.copy();
        this.velocity = vel.copy();
        this.age = 0;
        this.id = id;
    }

    deactivate() {
        this.active = false;
    }

}

function createCrystal(pos, vel, id, report){
    for (let crystal of crystals) {
        if (!crystal.active) {
            crystal.create(pos, vel, id);
            if (multiplayer && report){
                reportCreateCrystal(pos, vel, id);
            }
            break;
        }
    }
}

// Find an inactive bullet and fire it
function createCrystalBurst(num, pos, speed, spread) {

    randomSeed(frameCount);

    for (var i=0;i<num;i++){
        var spawnVector = createVector(0, speed);
        spawnVector.rotate(random(-spread, spread));
        spawnVector.mult(random(0.5, 1.5));
        createCrystal(pos, spawnVector, floor(random(0, 100000000)), true);
    }

}



// Draws all the active bullets in the pool
function drawCrystals() {
    for (let crystal of crystals) {
        if (crystal.active) {
            image(spriteCrystal, crystal.position.x, crystal.position.y, 15, 15);
        }
    }
}


