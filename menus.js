
var idField;    // Text field used for displaying the link


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
    fill(200);
    textSize(80);
    textAlign(CENTER, CENTER);
    //textFont(myFont);
    text("Character select", gameWidth/2, 50);
}



//  Mouse has been clicked! Find out what screen we are on and what button was clicked
function mouseClicked(){


    // Main menu screen
    if (appState == 1){
        if (mouseY/scaleFactor > 250 && mouseY/scaleFactor < 350){
            // singleplayer clicked!
            console.log("Singleplayer Clicked!");
            appState = 0;
            multiplayer = false;
            setupSingleplayer();
        }
        if (mouseY/scaleFactor > 350 && mouseY/scaleFactor < 450){
            // multiplayer clicked!
            console.log("Multiplayer Clicked!");
            appState = 2;   // Enter multiplayer lobby
            multiplayer = true;
            setupServer(peer);
        }
    }


}