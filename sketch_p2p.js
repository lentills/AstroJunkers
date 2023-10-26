
var playerNumber;   // Player 1 (server) or player 2?
var conn;



function setup() {

  var peer = new Peer();

  var peerID = getPeerIDFromURL();

  // If there's a peer ID in the URL, skip the menu and connect to Player 1
  if (peerID) {
    setupClient(peer, peerID);
    playerNumber = 2;
  } else {
    setupServer(peer);
    playerNumber = 1;
  }


  createCanvas(800, 1200);
  background(0);

}


function mousePressed() {

  if (playerNumber == 1){
    fill(255,50,50);
    ellipse(mouseX, mouseY, 20, 20);
  }else{
    fill(50,50,255);
    ellipse(mouseX, mouseY, 20, 20);
  }

  let dataToSend = {
    type: 'circle',
    x: mouseX,
    y: mouseY
  };
  
  conn.send(dataToSend);

}








//////////////////////////////////////
/// PEER TO PEER UTILITY FUNCTIONS ///
//////////////////////////////////////


function getPeerIDFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('peerID');
}


// Establish a connection on the server (Player 1) side
function setupServer(peer){

  peer.on('open', function (id) {
    console.log('My peer ID is: ' + id);
    var gameLink = `${window.location.href}?peerID=${id}`;
    console.log("Share this link with your opponent:", gameLink);

  });

  peer.on('connection', function (clientConnection) {
    console.log("Connected to opponent!");

    conn = clientConnection;

    conn.on('open', function () {
      // Receive messages
      conn.on('data', function (data) {
        console.log('Received', data);
        gotData(data);
      });

      // Send Messages
      conn.send('Hello from Player 1!');

    });


    
  });

}


// Establish a connection on the client (Player 2) side
function setupClient(peer, peerID){

  peer.on('open', function (id) {
    console.log('My peer ID is: ' + id);
    conn = peer.connect(peerID);
    console.log("Attempting to connect to opponent...");


    conn.on('open', function () {

      // Receive messages
      conn.on('data', function (data) {
        console.log('Received', data);
        gotData(data);
      });

      // Send messages
      conn.send('Hello from Player 2!');
    });


  });

}



function gotData(data){

  if (data.type === 'circle') {
    if (playerNumber == 2){
      fill(255,50,50);
      ellipse(data.x, data.y, 20, 20);
    }else{
      fill(50,50,255);
      ellipse(data.x, data.y, 20, 20);
    }
  }

}


