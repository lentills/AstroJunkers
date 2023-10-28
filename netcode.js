

// Multiplayer
var peer = null;
var myPeerID = null;




// Establish a connection on the server (Player 1) side
function setupServer(peer) {

    peer = new Peer();

    peer.on('open', function (id) {
        myPeerID = id;
        console.log('My peer ID is: ' + id);
        var gameLink = `${window.location.href}?peerID=${id}`;
        console.log("Share this link with your opponent:", gameLink);
        idField = createInput();
        idField.position(scaleFactor * (gameWidth/2)-250, 250);
        idField.size(500);
        idField.value(gameLink);

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

            // Go to next state, character select screen
            appState = 3;
            idField.hide();

        });



    });

}


// Establish a connection on the client (Player 2) side
function setupClient(peer, peerID) {

    peer = new Peer();

    peer.on('open', function (id) {
        //myPeerID = id;
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

            // Go to next state, character select screen
            appState = 3;

        });


    });

}



function gotData(data) {

    if (data.type === 'circle') {
        if (playerNumber == 2) {
            fill(255, 50, 50);
            ellipse(data.x, data.y, 20, 20);
        } else {
            fill(50, 50, 255);
            ellipse(data.x, data.y, 20, 20);
        }
    }

}




function getPeerIDFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('peerID');
}

