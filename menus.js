
var idField;    // Text field used for displaying the link

// Character selection utilities
var characterSelection = 0;            // Which character we are browsing
var opponentCharacterSelection = -1;    // Which character our opponent has selected
var characterSelected = false;          // If we have selected the character or not
var characterViewPosition = 0;          // Current position of view in character screen


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
    fill(7, 6, 56);
    rect(0, 0, gameWidth, gameHeight, 40);
    fill (200);
    textSize(80);
    textAlign(CENTER, CENTER);
    //textFont(myFont);
    text("Character select", gameWidth/2, 50);


    push();
    characterViewPosition = lerp(characterViewPosition, characterSelection * -1600, 0.15);
    translate(characterViewPosition, 0);    // Move the camera to where the character we are looking at is


    // Character 0 - Hopper and Skipp
    fill(150, 230, 80);
    circle(1200, 450, 300);

    translate(1600, 0);

    // Character 1 - Nyx
    fill(200, 50, 250);
    circle(1200, 450, 300);

    translate(1600, 0);

    // Character 2 - Yasmin
    fill(170, 80, 50);
    circle(1200, 450, 300);

    pop();

    // Draw buttons to navigate between characters here
    if (!characterSelected){

        if (mouseX/scaleFactor < 350 && mouseY/scaleFactor > 700 && !characterSelected){
            fill (200);
            circle(205, 700, 50);
        }

    }else{
        // TODO: some text here, "waiting for opponent" or something
    }
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
        }
        if (mouseX/scaleFactor > 1250 && mouseY/scaleFactor > 700 && !characterSelected){
            // Forwards buttons clicked
            characterSelection += 1;
            if (characterSelection > 2){
                characterSelection = 0;
            }
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