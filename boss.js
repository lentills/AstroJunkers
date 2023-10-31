



const NUM_TARGETS = 5;
let targets = [];
var spriteTarget;

class Target{

    constructor() {
        this.active = false;
        this.position = createVector(0, 0);
        this.health = 100;
        this.hit = 0;
    }

    update() {
        if (this.active) {

            if (this.health < 0) {
                reportDestroyObstacle(this.id, true);
                this.destroy();

                // TODO: release loot
            }

        }
    }

    hit(){
        this.hit = 3;
    }

    create(pos, vel, health) {
        this.active = true;
        this.position = pos.copy();
        this.velocity = vel.copy();
        this.health = health;
    }

    deactivate() {
        this.active = false;
    }

    // Deactivates the obstacle/enemy but makes them explode!
    destroy() {

        if (this.active) {
            this.deactivate();

            // TODO: explosion effect
        }

    }
}


function drawTargets() {
    for (let target of targets) {
        if (target.active) {
            push();
            if (target.hit > 0){
                target.hit --;
                tint(255, 0, 0);
            }
            image(spriteTarget, 0, 0, 120, 120);
            pop();
        }
    }
}


function loadBossSprites() {
    spriteTarget = loadImage('assets/temp/ufoRed.png');
}



