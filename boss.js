



const NUM_TARGETS = 4;
let targets = [];
var spriteTarget;
var spriteBoss;

class Target{

    constructor() {
        this.active = false;
        this.position = createVector(0, 0);
        this.health = 100;
        this.hitEffect = 0;
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
        this.hitEffect = 3;
    }

    create(pos, health) {
        this.active = true;
        this.position = pos.copy();
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
    image(spriteBoss, 5*tileSize, -15*tileSize, 3*tileSize, 3*tileSize*0.4); 
    for (let target of targets) {
        if (target.active) {
            push();
            if (target.hitEffect > 0){
                target.hitEffect --;
                //tint(255, 0, 0);
                fill(255, 0, 0, 200);
                circle(target.position.x, target.position.y, 85);
            }else{
                image(spriteTarget, target.position.x, target.position.y, 90, 90);
            }
            pop();
        }
    }
}


function loadBossSprites() {
    spriteTarget = loadImage('assets/temp/target.png');
    spriteBoss = loadImage('assets/temp/boss.png');
}


