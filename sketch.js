




function setup() {

  var peer = new Peer();



  var peerID = getPeerIDFromURL();

  // If there's a peer ID in the URL, skip the menu and connect to Player 1
  if (peerID) {

    peer.on('open', function (id) {
      console.log('My peer ID is: ' + id);
      var conn = peer.connect(peerID);
      console.log("Attempting to connect to opponent...");


      conn.on('open', function () {

        // Receive messages
        conn.on('data', function (data) {
          console.log('Received', data);
        });

        // Send messages
        conn.send('Hello from Player 2!');
      });


    });





  } else {


    peer.on('open', function (id) {
      console.log('My peer ID is: ' + id);
      var gameLink = `${window.location.href}?peerID=${id}`;
      console.log("Share this link with your opponent:", gameLink);

    });

    peer.on('connection', function (conn) {
      console.log("Connected to opponent!");


      conn.on('open', function () {
        // Receive messages
        conn.on('data', function (data) {
          console.log('Received', data);
        });

        // Send Messages
        conn.send('Hello from Player 1!');

      });


      
    });
  }
}

function getPeerIDFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('peerID');
}
