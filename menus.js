
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

function loadMenuAssets(){
    fontWhiteRabbit = loadFont('assets/whitrabt.ttf');
    spriteNyxWireframe = loadImage('assets/NyxShipWireframe.png');
    spriteYasminWireframe = loadImage('assets/YasminShipWireframe.png');
    spriteHopperSkippWireframe = loadImage('assets/HopperSkippShipWireframe.png');
}


function drawMainMenu(){

    fill(200);
    textSize(80);
    textAlign(CENTER, CENTER);
    //textFont(myFont);
    text("AstroJunkers", gameWidth/2, 50);


    textSize(40);
    fill(150);
    if (mouseY/scaleFactor > 250 && mouseY/scaleFactor < 350){
        fill(230);
    }
    text("Singleplayer", gameWidth/2, 300);

    fill(150);
    if (mouseY/scaleFactor > 350 && mouseY/scaleFactor < 450){
        fill(230);
    }
    text("Multiplayer", gameWidth/2, 400);

}



function drawMutliplayerLobby(){
    fill(200);
    textSize(80);
    textAlign(CENTER, CENTER);
    //textFont(myFont);
    text("Multiplayer", gameWidth/2, 50);

    if (myPeerID == null){
        textSize(40);
        text("Connecting...", gameWidth/2, 150);
    }else{
        textSize(40);
        text("Share this link with your opponent:", gameWidth/2, 150);
    }

}


function drawCharacterSelect(){

    printClock ++;
    fill(7, 6, 56);
    rect(0, 0, gameWidth, gameHeight, 40);


    // Draw starfield in background
    drawBackground(0);

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
    printText("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", printClock);

    image(spriteHopperSkippWireframe, 425, 650, 440, 290);

    fill(150, 230, 80);
    circle(1200, 450, 300);

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
    printText("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", printClock);

    image(spriteNyxWireframe, 425, 650, 440, 306);

    fill(200, 50, 250);
    circle(1200, 450, 300);


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
    printText("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", printClock);

    image(spriteYasminWireframe, 425, 650, 480, 270);

    fill(170, 80, 50);
    circle(1200, 450, 300);


    pop();


    // Draw buttons to navigate between characters here

    fill (80, 0, 20);
    rect (0, 800, 1600, 100);
    if (!characterSelected){

        if (mouseX/scaleFactor < 350 && mouseY/scaleFactor > 700 && !characterSelected){
            fill (200);
            circle(205, 700, 50);
        }

    }else{
        // TODO: some text here, "waiting for opponent" or something
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


//  Mouse has been clicked! Find out what screen we are on and what button was clicked
function mouseClicked(){


    // Main menu screen
    if (appState == 1){
        if (mouseY/scaleFactor > 250 && mouseY/scaleFactor < 350){
            // singleplayer clicked!
            console.log("Singleplayer Clicked!");
            appState = 3;
            multiplayer = false;
            //setupSingleplayer();
        }
        if (mouseY/scaleFactor > 350 && mouseY/scaleFactor < 450){
            // multiplayer clicked!
            console.log("Multiplayer Clicked!");
            appState = 2;   // Enter multiplayer lobby
            multiplayer = true;
            setupServer(peer);
        }
    }


    // Character select
    if (appState == 3){

        if (mouseX/scaleFactor < 350 && mouseY/scaleFactor > 700 && !characterSelected){
            // Back button clicked
            characterSelection -= 1;
            if (characterSelection < 0){
                characterSelection = 2;
            }
            printClock = 0;
        }
        if (mouseX/scaleFactor > 1250 && mouseY/scaleFactor > 700 && !characterSelected){
            // Forwards buttons clicked
            characterSelection += 1;
            if (characterSelection > 2){
                characterSelection = 0;
            }
            printClock = 0;
        }
        //console.log(characterSelection);
        if (mouseX/scaleFactor < 1100 && mouseX/scaleFactor > 500 && mouseY/scaleFactor > 700 && !characterSelected){
            // Select button clicked
            characterSelected = true;
            if (multiplayer){
                // Send packet and start waiting i guess?
            }else{
                appState = 0;
                setupSingleplayer(characterSelection);
            }
        }

    }


}








// Prints text in a scrolling effect
function printText(theText, charactersToPrint) {

    if (charactersToPrint > theText.length/2){
        charactersToPrint = theText.length/2;
    }
    textAlign(LEFT, TOP);
    textSize(20);
    fill(60, 255, 120);
    text(theText.substring(0, charactersToPrint*2), 140, 265, 580, 800);
}


