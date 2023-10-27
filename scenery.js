
const BACKGROUND_LENGTH = gameHeight*4; // How many screens tall should the background be?

// Draws the far background, that moves very slowly based on the player's position in the map
// offset is a number from 0.0-1.0 that determines how far up the starfield we should draw.
// Call this with how far the player is through the map
function drawBackground(offset) {

    offset = max(min(offset, 1.0), 0.0);    // Clip value to 0.0-1.0

    // Set a fixed seed so that star positions are consistent between frames
    randomSeed(0);

    for (let i = 0; i < 500; i++) {
        let x = random(gameWidth - 10);
        let y = random(-BACKGROUND_LENGTH, gameHeight);

        if (y < -offset*BACKGROUND_LENGTH + gameHeight){    // don't bother drawing stars off the screen
            if (floor(y)%2 === 0) {   // Choose one of two star sprites
                image(spriteStar1, x, y + offset*BACKGROUND_LENGTH, 4, 4);
            } else {
                image(spriteStar2, x, y + offset*BACKGROUND_LENGTH, 6, 6);
            }
        }

    }

}



// TODO: fix this
function drawStarfield(size) {
    // Set a fixed seed so that random numbers are consistent
    randomSeed(size);

    for (let i = 0; i < 250; i++) {
        let x = random(gameWidth - 10);
        let y = random(gameHeight - 10);
        let choice = floor(random(2));  // Choose either spriteStar1 or spriteStar2

        if (choice === 0) {
            image(spriteStar1, x, y, size, size);
        } else {
            image(spriteStar2, x, y, size + 2, size + 2);
        }
    }

}


// Draws rects around the edges of the game area so we can't see stuff rendered off there
function drawBlinders() {
    fill(30, 10, 10);
    rect(-10000, -10000, 20000, 10000);
    rect(-10000, -10000, 10000, 20000);
    rect(gameWidth, -10000, 20000, 20000);
    rect(-10000, gameHeight, 20000, 20000);
}
