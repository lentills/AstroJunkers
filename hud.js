
let spriteHudRight, spriteHudLeft;
let spriteYasminNeutral, spriteYasminAngry, spriteYasminHappy;
let spriteSkippNeutral, spriteSkippAngry, spriteSkippHappy;

function loadHUD(){

    spriteHudLeft = loadImage('assets/hud_left.png');
    spriteHudRight = loadImage('assets/hud_right.png');

    spriteYasminNeutral = loadImage('assets/hud_yasmin_neutral.png');
    spriteYasminAngry = loadImage('assets/hud_yasmin_angry.png');
    spriteYasminHappy = loadImage('assets/hud_yasmin_happy.png');

    spriteSkippNeutral = loadImage('assets/hud_skipp_neutral.png');
    spriteSkippHappy = loadImage('assets/hud_skipp_happy.png');
    spriteSkippAngry = loadImage('assets/hud_skipp_angry.png');

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

    // Draw character camera
    if (ship.character == 0){
        if (ship.isCrashing > 0){
            image(spriteSkippAngry, 155, 900-144, 204, 204);
        }else if (ship.ultimate > 1){
            image(spriteSkippHappy, 155, 900-144, 204, 204);
        }else{
            image(spriteSkippNeutral, 155, 900-144, 204, 204);
        }
    }else if (ship.character == 1){
    }else if (ship.character == 2){
        if (ship.isCrashing > 0){
            image(spriteYasminAngry, 155, 900-144, 204, 204);
        }else if (ship.ultimate > 1){
            image(spriteYasminHappy, 155, 900-144, 204, 204);
            // Yasmin is lit up by ultimate effect
            if (frameCount%5 == 0){
                fill(180, 255, 255, 30);
                circle(155, 900-144, 204);
            }
        }else{
            image(spriteYasminNeutral, 155, 900-144, 204, 204);
        }
    }
    
    

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
    fill (50, 120, 185);
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


