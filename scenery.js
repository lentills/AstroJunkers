
const BACKGROUND_LENGTH = gameHeight*8; // How many screens tall should the background be?

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

        if (y < -offset*BACKGROUND_LENGTH + gameHeight && y > -offset*BACKGROUND_LENGTH){    // don't bother drawing stars off the screen
            if (floor(y)%2 === 0) {   // Choose one of two star sprites
                image(spriteStar1, x, y + offset*BACKGROUND_LENGTH, 6, 6);
            } else {
                image(spriteStar2, x, y + offset*BACKGROUND_LENGTH, 10, 10);
            }
        }

    }

}


// Draws the map's tiles into the world
function drawMapTiles(mapID){

    for (var x=0;x<mapWidth;x++){
        for (var y=0;y<mapHeight;y++){

            let spriteID = mapTiles[mapID][y*mapWidth + x] - 1;
            if (spriteID != -1 && spriteID != 10){
                imageMode(CORNER);
                image(tileSprites[spriteID], x*tileSize, -y*tileSize-tileSize, tileSize, tileSize);
                imageMode(CENTER);
            }

        }
    }

}


// Draws rects around the edges of the game area so we can't see stuff rendered off there
function drawBlinders() {
    fill(0);
    rect(-10000, -10000, 20000, 10000);
    rect(-10000, -10000, 10000, 20000);
    rect(gameWidth, -10000, 20000, 20000);
    rect(-10000, gameHeight, 20000, 20000);
}
