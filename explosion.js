

class Explosion {
    constructor(x, y, size, frames) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.frames = frames;
        this.currentFrame = 0;
        this.finished = false;
        this.frameDuration = 1000 / 15; // Duration of each frame in milliseconds (for 15 fps)
        this.lastFrameChangeTime = 0;
    }

    update() {
        // Check if it's time to update to the next frame
        if (millis() - this.lastFrameChangeTime > this.frameDuration) {
            this.currentFrame++;
            this.lastFrameChangeTime = millis();

            // Check if the animation is finished
            if (this.currentFrame >= this.frames.length) {
                this.finished = true;
            }
        }
    }

    draw() {
        // Draw the current frame
        if (!this.finished) {
            image(this.frames[this.currentFrame], this.x, this.y, this.size, this.size);
        }
    }
}

// Array to store active explosions
let explosions = [];

// Function to add a new explosion
function addExplosion(x, y, size, frames) {
    explosions.push(new Explosion(x, y, size, frames));
    createParticleExplosion(createVector(x, y), 50, size*1.5, 500, [255, 220, 180], 1.5);
}

// Update and draw all explosions
function handleExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update();
        explosions[i].draw();

        // Remove finished explosions
        if (explosions[i].finished) {
            explosions.splice(i, 1);
        }
    }
}


let explosionFrames = []; // Array to store the frames

function loadExplosionSprites(){
    explosionFrames.push(loadImage('assets/Explosion-1.png'));
    explosionFrames.push(loadImage('assets/Explosion-2.png'));
    explosionFrames.push(loadImage('assets/Explosion-3.png'));
    explosionFrames.push(loadImage('assets/Explosion-4.png'));
    explosionFrames.push(loadImage('assets/Explosion-5.png'));
    explosionFrames.push(loadImage('assets/Explosion-6.png'));
}

