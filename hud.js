
let spriteHudRight, spriteHudLeft;

function loadHUD(){

    spriteHudLeft = loadImage('assets/hud_left.png');
    spriteHudRight = loadImage('assets/hud_right.png');

}

// Draws all elements of the HUD
function drawHUD(ship){

    drawHealthBar(ship);
    drawCooldown(ship);
    drawScore(ship);
    drawUltimateBar();

    // Black out back of character display
    fill(0, 0, 0);
    circle(155, 900-144, 204);

    // Draw the HUD outlines
    image(spriteHudLeft,  40+220, 900-30-115, 440, 230);
    image(spriteHudRight, 1600-40-150, 900-40-56, 300, 112);

}

// Draws the health bar for the given ship
function drawHealthBar(ship){

    //rect (1600 - 327, 900 - 135, 273, 30);

    if (ship.invincibility > 0){
        fill (150, 10, 110);
        rect (1600 - 327, 900 - 135, 273 * ((2000-ship.invincibility)/2000), 30);
    }else{
        fill (230, 30, 60);
        rect (1600 - 327, 900 - 135, 273 * (max(ship.health, 0) / characterStats[ship.character].health), 30);
    }

}


// Draws the cooldown bar under the health bar
function drawCooldown(ship){
    fill (50, 110, 155);
    rect (1600 - 327, 900 - 90, 273 * (max(ship.fireCooldown, 0) / 3000), 30);
}


function drawUltimateBar(){
    fill (70, 160, 130);
    rect (200, 900 - 100, 265 * (max(ultimateCharge, 0) / 100000), 48);

    if (ultimateCharge > 99990){
        fill (23, 209, 138, floor(abs(255*sin(frameCount*2))));
        rect (200, 900 - 100, 265 * (max(ultimateCharge, 0) / 100000), 48);
        textSize(40);
        textFont(fontWhiteRabbit);
        textAlign(CENTER, CENTER);
        text("Q", 490, 828);
    }
}

function drawScore(ship){
    fill(0, 250, 250, 250);
    textSize(40);
    textFont(fontWhiteRabbit);
    textAlign(CENTER, CENTER);
    text(ship.score, 800, 850);
}


