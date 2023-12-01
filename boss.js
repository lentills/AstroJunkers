


const BOSS_POSITION = 26;    // Y position of the pos in tiles
const NUM_TARGETS = 4;
let targets = [];
var spriteTarget;
var spriteBoss;
var bossAlive = true;

class Target{

    constructor() {
        this.active = false;
        this.position = createVector(0, 0);
        this.health = 100;
        this.hitEffect = 0;
        this.id = -1;
    }

    update() {
        if (this.active) {

            if (this.health < 0) {
                reportDestroyTarget(this.id);
                createCrystalBurst(40, this.position, 200, 50);
                this.destroy();
            }

        }
    }

    hit(){
        this.hitEffect = 3;
    }

    create(pos, health, id) {
        this.active = true;
        this.position = pos.copy();
        this.health = health;
        this.id = id;
    }

    deactivate() {
        this.active = false;
    }

    // Deactivates the obstacle/enemy but makes them explode!
    destroy() {

        if (this.active) {
            this.deactivate();
            addExplosion(this.position.x, this.position.y, 300, explosionFrames);
            
        }

        // Check to see if this is the last target
        bossAlive = false;
        for (let target of targets) {
            if (target.active) {
                bossAlive = true;
            }
        }

        if (!bossAlive){
            reportDestroyBoss();
            addExplosion(5*tileSize, -BOSS_POSITION*tileSize, 2000, explosionFrames);
            if (playerID == 1){
                createObstacle(-1, createVector(5*tileSize-150, -BOSS_POSITION*tileSize+220), createVector(0, -10), 150, 60, 150, 2, true, 100);
                createObstacle(-1, createVector(5*tileSize+150, -BOSS_POSITION*tileSize+220), createVector(0, -10), 150, 60, 150, 2, true, 100);
            }
        }

    }
}


function drawTargets() {

    if (!bossAlive){
        return;
    }

    image(spriteBoss, 5*tileSize, -BOSS_POSITION*tileSize, 3*tileSize, 3*tileSize*0.4); 
    for (let target of targets) {
        if (target.active) {
            push();
            if (target.hitEffect > 0){
                target.hitEffect --;
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
    spriteTarget = loadImage('assets/target.png');
    spriteBoss = loadImage('assets/boss.png');
}


