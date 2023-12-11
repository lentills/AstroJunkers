
var idField;    // Text field used for displaying the link

// Character selection utilities
var characterSelection = 0;            // Which character we are browsing
var opponentCharacterSelection = -1;    // Which character our opponent has selected
var characterSelected = false;          // If we have selected the character or not
var characterViewPosition = 0;          // Current position of view in character screen
var printClock = 0;   // Counts frames since last switched character, used for drawing out text

// Assets
let fontWhiteRabbit;
let spriteNyxWireframe, spriteYasminWireframe, spriteHopperSkippWireframe;
let spriteNyxPortrait, spriteYasminPortrait, spriteHopperSkippPortrait;
let spriteMainMenuSplash, spriteMainMenuSplashBG;

function loadMenuAssets(){
    fontWhiteRabbit = loadFont('assets/whitrabt.ttf');

    spriteMainMenuSplash = loadImage('assets/astroJunkersSplash.png');
    spriteMainMenuSplashBG = loadImage('assets/astroJunkersSplash_BG.png');

    spriteNyxWireframe = loadImage('assets/NyxShipWireframe.png');
    spriteYasminWireframe = loadImage('assets/YasminShipWireframe.png');
    spriteHopperSkippWireframe = loadImage('assets/HopperSkippShipWireframe.png');

    spriteNyxPortrait = loadImage('assets/NyxPortrait.png');
    spriteYasminPortrait = loadImage('assets/YasminPortrait.png');
    spriteHopperSkippPortrait = loadImage('assets/Hopper_And_SkippPortrait.png');
}


// character select has a 3d starfield effect. This initialises the stars
let stars = [];
const numStars = 400;
function initialiseStarfield(){

    stars = [];

    for (let i = 0; i < numStars; i++) {
        stars.push(createStar());
    }

}

function drawStarField(){
    push();

    // Move the 'camera' back a bit on the z-axis for better perspective
    translate(gameWidth/2, gameHeight/2, -500);

    stars.forEach((star, index) => {
        star.z -= 10; // Move star towards the viewer

        // Calculate the projected 2D position
        let sx = map(star.x / star.z, 0, 1, 0, width);
        let sy = map(star.y / star.z, 0, 1, 0, height);
        let r = map(star.z, 0, gameWidth, 6, 2);

        // Draw star
        fill(255);
        noStroke();
        //circle(sx, sy, r);
        image(spriteStar1, sx, sy, 2*r, 2*r);

        // Reset star if it moves too close
        if (star.z < 5) {
            stars[index] = createStar();
        }
    });
    pop();
}

function createStar() {
    let x = random(-500, 500);
    let y = random(-500, 500);
    let z = random(1500, 3000); // Start far away on the z-axis
    return { x, y, z };
}


function drawMainMenu(){

    fill(7, 6, 56);
    rect(0, 0, gameWidth, gameHeight, 40);

    // Rotating galaxy in background
    push();
    translate(gameWidth/2, gameHeight/2-100);
    rotate((frameCount/3)%360);
    image(spriteMainMenuSplashBG, 0, 0, gameHeight*0.8, gameHeight*0.8);
    pop();

    // Draw starfield in background
    drawStarField();

    // Draw the splash
    image(spriteMainMenuSplash, gameWidth/2, gameHeight/2-100, gameHeight*0.9, gameHeight*0.9);


    textSize(40);
    textFont(fontWhiteRabbit);
    textAlign(CENTER, CENTER);
    fill(50, 255, 100, 180);
    if (mouseY/scaleFactor > gameHeight/2+160 && mouseY/scaleFactor < gameHeight/2+240){
        fill(50, 255, 100, 255);
    }
    text("Multiplayer", gameWidth/2, gameHeight/2+200);

    fill(50, 255, 100, 180);
    textSize(30);
    if (mouseY/scaleFactor > gameHeight/2+260 && mouseY/scaleFactor < gameHeight/2+340){
        fill(50, 255, 100, 255);
    }
    text("Singleplayer", gameWidth/2, gameHeight/2+300);

}



function drawMutliplayerLobby(){

    fill(7, 6, 56);
    rect(0, 0, gameWidth, gameHeight, 40);

    // Rotating galaxy in background
    push();
    translate(gameWidth/2, gameHeight/2-100);
    rotate((frameCount/3)%360);
    image(spriteMainMenuSplashBG, 0, 0, gameHeight*0.8, gameHeight*0.8);
    pop();

    // Draw starfield in background
    drawStarField();

    fill(50, 255, 100, 180);
    textSize(80);
    textAlign(CENTER, CENTER);
    textFont(fontWhiteRabbit);
    
    text("Multiplayer", gameWidth/2, 250);

    if (myPeerID == null){
        textSize(40);
        text("Connecting...", gameWidth/2, 400);
    }else{
        textSize(40);
        text("Share this link with your opponent:", gameWidth/2, 400);
    }

}


function drawCharacterSelect(){

    printClock ++;
    fill(7, 6, 56);
    rect(0, 0, gameWidth, gameHeight, 40);


    // Draw starfield in background
    drawStarField();

    push();
    characterViewPosition = lerp(characterViewPosition, characterSelection * -1600, 0.15);
    translate(characterViewPosition, 0);    // Move the camera to where the character we are looking at is
    

    // Character 0 - Hopper and Skipp
    drawCharacterFrame();

    fill(60, 255, 120);
    textSize(65);
    textAlign(CENTER, CENTER);
    text("HOPPER AND SKIPP", 425, 175);
    textSize(25);
    textAlign(LEFT, CENTER);
    text("Proxima Centauri b", 190, 230);
    printText("Two notorious scavengers, Hopper and Skipp are a pair who make their living intercepting distress signals to locate shipwrecks and merchant vessels for cargo and parts. They travel in a ship cobbled from scraps from their previous exploits.\nIt is believed that they are in posession of a weapons system stolen from a destroyed Galactic Federation ship.\nEngage with extreme caution", printClock);

    image(spriteHopperSkippWireframe, 325, 650, 440, 290);
    textSize(15);
    text("Speed:     ***\nAgility:   ****\nStrength:  ***\nFirepower: *****", 540, 600);

    image(spriteHopperSkippPortrait, 1150, 410, 1032, 800);

    translate(1600, 0);



    // Character 1 - Nyx
    drawCharacterFrame();

    fill(60, 255, 120);
    textSize(65);
    textAlign(CENTER, CENTER);
    text("NYX", 425, 175);
    textSize(25);
    textAlign(LEFT, CENTER);
    text("Antares 4b", 190, 230);
    printText("An infamous space pirate from the Antares system, Nyx is known for her bold heists and ruthless demenour. Once a low-tier smuggler, she became known to the Federation after a series of high-profile raids against Federation supply lines.\nHer ship is equipped with a powerful EMP, which delivers a devistating pulse of energy into nearby ships.", printClock);

    image(spriteNyxWireframe, 325, 650, 440, 306);
    textSize(15);
    text("Speed:     *****\nAgility:   *****\nStrength:  **\nFirepower: ***", 545, 600);

    image(spriteNyxPortrait, 1200, 410, 800, 800);


    translate(1600, 0);



    // Character 2 - Yasmin
    drawCharacterFrame();

    fill(60, 255, 120);
    textSize(65);
    textAlign(CENTER, CENTER);
    text("YASMIN", 425, 175);
    textSize(25);
    textAlign(LEFT, CENTER);
    text("Earth (Sol-3)", 190, 230);
    printText("Once a decorated pilot of the Galactic Federation, Yasmin is now one of the most wanted figures in the galaxy.\nAfter a dispute with her higher-ups she defected to piracy, vanishing with the Astra II, the Federations most advanced starfighter.\nThe ship is equipped with a powerful overclocking mechanism allowing the fighter to drastically boost the fire rate of the ship's guns.", printClock);

    image(spriteYasminWireframe, 325, 650, 480, 270);
    textSize(15);
    text("Speed:     ***\nAgility:   **\nStrength:  *****\nFirepower: ****", 550, 600);

    image(spriteYasminPortrait, 1200, 410, 800, 800);


    pop();


    // Draw buttons to navigate between characters here

    fill (80, 0, 20);
    rect (0, 800, 1600, 100);
    if (!characterSelected){

        textFont(fontWhiteRabbit);
        textSize(80);
        textAlign(CENTER, CENTER);

        // Align mouse positions to relative game scale and translation
        let horizontalOffset = (windowWidth - (gameWidth * scaleFactor)) / 2;
        let mouseGameX = (mouseX - horizontalOffset) / scaleFactor;
        let mouseGameY = mouseY / scaleFactor;

        fill(252, 152, 45, 80);
        if (mouseGameX < 250 && mouseGameY > 780 && !characterSelected){
            fill(252, 152, 45, 255);
        }
        text("<", 120, 860);
        
        fill(252, 152, 45, 80);
        if (mouseGameX > 1350 && mouseGameY > 780 && !characterSelected){
            fill(252, 152, 45, 255);
        }
        text(">", 1480, 860);

        fill(252, 152, 45, 80);
        textSize(65);
        if (mouseGameX < 1000 && mouseGameX > 600 && mouseGameY > 780 && !characterSelected){
            fill(252, 152, 45, 255);
        }
        text("SELECT", 800, 860);

    }else{
        fill(252, 152, 45, 255);
        textSize(65);
        textAlign(CENTER, CENTER);
        text("WAITING FOR OPPONENT", 800, 860);
    }
}


function drawCharacterFrame(){
    fill (0, 5, 0, 180);
    rect(100, 80, 650, 800, 20);

    stroke(0, 255, 0);
    strokeWeight(1);
    line(100+5, 80+25, 100+5, 900);
    line(100+10, 80+27, 100+10, 900);

    line(750-5, 80+25, 750-5, 900);
    line(750-12, 80+25, 750-10, 900);

    line(100+20, 80+5, 750-20, 80+5);
    line(100+25, 80+10, 750-25, 80+10);

    line (100+5, 80+25, 100+15, 80+12);
    line (100+10, 80+27, 100+20, 80+14);
    line (100+20, 80+14, 100+20, 80+5);

    line (750-5, 80+25, 750-15, 80+12);
    line (750-12, 80+25, 750-20, 80+14);
    line (750-20, 80+14, 750-20, 80+5);

    noStroke();
    fill(60, 255, 120);
    textFont(fontWhiteRabbit);
    textSize(28);
    textAlign(CENTER, CENTER);
    text("Galactic Federation Criminal Database", 425, 80+35);

    tint(50, 255, 100);
    image(spriteStar2, 150, 230, 30, 30);
    tint(255);

}




function drawStartGameCountdown(){

    fill(7, 4, 60, 150 - max(0, 150-startGameCountdown));
    rect(0, 0, gameWidth, gameHeight, 40);

    noStroke();
    fill(60, 255, 120);
    textFont(fontWhiteRabbit);
    textAlign(CENTER, CENTER);

    textSize(70);
    if (playerShip.character == 0){
        image(spriteHopperSkippPortrait, 420 - 2*max(0, 500-startGameCountdown) , 550, 1032, 800);
        text("HOPPER AND SKIPP", 400 - 2*max(0, 500-startGameCountdown), 150);
    }
    if (playerShip.character == 1){
        image(spriteNyxPortrait, 420 - 2*max(0, 500-startGameCountdown) , 550, 800, 800);
        text("NYX", 400 - 2*max(0, 500-startGameCountdown), 150);
    }
    if (playerShip.character == 2){
        image(spriteYasminPortrait, 420 - 2*max(0, 500-startGameCountdown) , 550, 800, 800);
        text("YASMIN", 400 - 2*max(0, 500-startGameCountdown), 150);
    }

    textSize(50);
    text("vs", 800, 200 - 2*max(0, 500-startGameCountdown));

    if (multiplayer){
        textSize(70);
        if (opponentShip.character == 0){
            image(spriteHopperSkippPortrait, 1180 + 2*max(0, 500-startGameCountdown) , 550, 1032, 800);
            text("HOPPER AND SKIPP", 1180 + 2*max(0, 500-startGameCountdown), 150);
        }
        if (opponentShip.character == 1){
            image(spriteNyxPortrait, 1180 + 2*max(0, 500-startGameCountdown) , 550, 800, 800);
            text("NYX", 1180 + 2*max(0, 500-startGameCountdown), 150);
        }
        if (opponentShip.character == 2){
            image(spriteYasminPortrait, 1180 + 2*max(0, 500-startGameCountdown) , 550, 800, 800);
            text("YASMIN", 1180 + 2*max(0, 500-startGameCountdown), 150);
        }
    }


}


function endGameScreen(){

    gameInSession -= deltaTime;    // This slowly fades in the game over screen

    fill(7, 4, 60, min(max(0, abs(gameInSession/5)), 200));
    rect(0, 0, gameWidth, gameHeight, 40);

    if (gameInSession < -800){

        fill(60, 255, 120);
        textFont(fontWhiteRabbit);
        textAlign(CENTER, CENTER);
        textSize(70);

        if (multiplayer){
            if (playerShip.score > opponentShip.score){
                text("YOU WIN", gameWidth/2, 200);
            }else if (playerShip.score < opponentShip.score){
                text("YOU LOSE", gameWidth/2, 200);
            }else{
                text("DRAW", gameWidth/2, 200);
            }
        }else{
            text("YOU WIN", gameWidth/2, 200);
        }


        text("Score: " + playerShip.score, gameWidth/2-500, 800);

        if (multiplayer){
            text("Opponent: " + opponentShip.score, gameWidth/2+500, 800);
        }

    }

    if (gameInSession < -8000){
        // Go back to character select screen
        appState = 3;
        characterSelection = 0;
        opponentCharacterSelection = -1;
        characterSelected = false;
        characterViewPosition = 0;

        // Play the menu screen
        soundMusic2.stop();
        soundMusic1.play();
    }

}


//  Mouse has been clicked! Find out what screen we are on and what button was clicked
function mouseClicked() {


    // Align mouse positions to relative game scale and translation
    let horizontalOffset = (windowWidth - (gameWidth * scaleFactor)) / 2;
    let mouseGameX = (mouseX - horizontalOffset) / scaleFactor;
    let mouseGameY = mouseY / scaleFactor;


    // Main menu screen
    if (appState == 1) {
        if (mouseY/scaleFactor > gameHeight/2+260 && mouseY/scaleFactor < gameHeight/2+340) {
            // singleplayer clicked!
            console.log("Singleplayer Clicked!");
            appState = 3;
            multiplayer = false;
            //setupSingleplayer();
        }
        if (mouseY/scaleFactor > gameHeight/2+160 && mouseY/scaleFactor < gameHeight/2+240){
            // multiplayer clicked!
            console.log("Multiplayer Clicked!");
            appState = 2;   // Enter multiplayer lobby
            multiplayer = true;
            opponentCharacterSelection = -1;
            setupServer(peer);
        }
    }


    // Character select
    if (appState == 3){

        if (mouseGameX < 250 && mouseGameY > 780 && !characterSelected){
            // Back button clicked
            characterSelection -= 1;
            if (characterSelection < 0){
                characterSelection = 2;
            }
            printClock = 0;
        }
        if (mouseGameX > 1350 && mouseGameY > 780 && !characterSelected){
            // Forwards buttons clicked
            characterSelection += 1;
            if (characterSelection > 2){
                characterSelection = 0;
            }
            printClock = 0;
        }
        //console.log(characterSelection);
        if (mouseGameX < 1000 && mouseGameX > 600 && mouseGameY > 780 && !characterSelected){
            // Select button clicked
            characterSelected = true;
            if (multiplayer){
                // Send packet and start waiting
                reportCharacterSelection(characterSelection);
                if (opponentCharacterSelection != -1 && (typeof opponentCharacterSelection !== 'undefined') ){
                    setupMultiplayerplayer(characterSelection, opponentCharacterSelection);
                    appState = 0;
                }
            }else{
                appState = 0;
                setupSingleplayer(characterSelection);
            }
        }

    }


}








// Prints text in a scrolling effect
function printText(theText, charactersToPrint) {

    textAlign(LEFT, TOP);
    textSize(20);
    fill(60, 255, 120);
    textFont('Courier New');
    
    if (charactersToPrint > theText.length/2){
        text(theText, 140, 265, 580, 800);
        //text(theText, 140, 265);
    }else{
        text(theText.substring(0, charactersToPrint*2), 140, 265, 580, 800);
    }

}


