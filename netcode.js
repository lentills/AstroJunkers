

// Multiplayer
var peer = null;
var myPeerID = null;

const REPORT_RATE_SHIP_UPDATE = 90;    // Send a ship update every x millis
const REPORT_OBSTACLE_UPDATE = 50;    // Send an update about one obstacle every x millis

var timestampLast = 0;      // Timestamp of last packet recieved
var timestampShipUpdate = 0;  // Timestamp since we last sent an update of our ship state
var timestampObstacleUpdate = 0;    // etc
var lastObstacleUpdated = 0;




// Called every frame, determines if it is time to synchronise ship pos and stuff
function syncGamestates() {

    // Send a ship update
    if (Date.now() > timestampShipUpdate + REPORT_RATE_SHIP_UPDATE) {
        reportPlayerState(playerShip);
        timestampShipUpdate = Date.now();
    }

    // Send an obstacle update
    if (Date.now() > timestampObstacleUpdate + REPORT_OBSTACLE_UPDATE && playerID == 1) {
        for (var i = lastObstacleUpdated; i < MAX_OBSTACLES; i++) {
            if (obstacles[i].active) {
                reportObstacle(obstacles[i]);
                lastObstacleUpdated = i;
                break;
            }
            lastObstacleUpdated = i;
        }
        lastObstacleUpdated ++;
        if (lastObstacleUpdated > MAX_OBSTACLES) {
            lastObstacleUpdated = 0;
        }
        timestampObstacleUpdate = Date.now();
    }

}



// Establish a connection on the server (Player 1) side
function setupServer(peer) {

    peer = new Peer();

    peer.on('open', function (id) {
        myPeerID = id;
        console.log('My peer ID is: ' + id);
        var gameLink = `${window.location.href}?peerID=${id}`;
        console.log("Share this link with your opponent:", gameLink);
        idField = createInput();
        idField.position(scaleFactor * (gameWidth / 2) - 250, 250);
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
            appState = 0;
            idField.hide();

            playerID = 1;
            setupMultiplayerplayer();

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

            // Go to next state, character select screen TODO
            playerID = 2;
            appState = 0;
            setupMultiplayerplayer();

        });


    });

}


// Reports the data of a ship object to the other player
//{ playerID: playerID, character: 0, pos: createVector(2200, 0), rot: 0, rotVel: 0,
// vel: createVector(0, 0), health: 100, sprite: spriteShip, controlAccel: 0,
//  controlRot: 0, controlFire: false, isCrashing: -1 };
function reportPlayerState(ship) {

    if (multiplayer){
        // Clean up the data of the ship and send it across
        let dataToSend = {
            type: 'shipState',
            timestamp: Date.now(),
            playerID: ship.playerID,
            character: ship.character,
            posX: ship.pos.x,
            posY: ship.pos.y,
            rot: ship.rot,
            rotVel: ship.rotVel,
            velX: ship.vel.x,
            velY: ship.vel.y,
            health: ship.health,
            controlAccel: ship.controlAccel,
            controlRot: ship.controlRot,
            controlFire: ship.controlFire,
            isCrashing: ship.isCrashing,
            invincibility: ship.invincibility,
            fireCooldown: ship.fireCooldown,
            ultimate: ship.ultimate
        };

        conn.send(dataToSend);
    }

}

// A more granular event that reports if the current player has started or stopped firing
function reportPlayerFiring(isfiring) {

    if (multiplayer){
        let dataToSend = {
            type: 'isFiring',
            isFiring: isfiring
        };
    
        conn.send(dataToSend);
    }

}


// Reports about an obstacle. If this is a new obstacle it will be created on the other end
function reportObstacle(ob) {

    if (multiplayer){
        let dataToSend = {
            type: 'obstacle',
            id: ob.id,
            active: ob.active,
            posX: ob.position.x,
            posY: ob.position.y,
            velX: ob.velocity.x,
            velY: ob.velocity.y,
            health: ob.health,
            weight: ob.weight,
            radius: ob.radius,
            sprite: ob.sprite,
            isEnemy: ob.isEnemy,
            shotCooldown: ob.shotCooldown,
            shotCount: ob.shotCount,
            fireRate: ob.fireRate
        };
    
        conn.send(dataToSend);
    }

}

function reportDestroyObstacle(obstacleID, makeExplode) {

    if (multiplayer){
        let dataToSend = {
            type: 'destroyObstacle',
            id: obstacleID,
            explode: makeExplode
        };
    
        conn.send(dataToSend);
    }

}

function reportDestroyTarget(targetID) {

    if (multiplayer){
        let dataToSend = {
            type: 'destroyTarget',
            id: targetID,
        };
    
        conn.send(dataToSend);
    }

}

function reportDestroyBoss() {

    if (multiplayer){
        let dataToSend = {
            type: 'destroyTarget'
        };
    
        conn.send(dataToSend);
    }

}


function reportUltimate(characterUlt, ultTime){

    if (multiplayer){
        let dataToSend = {
            type: 'ultimate',
            character: characterUlt,
            owner: playerID,
            time: ultTime
        };
    
        conn.send(dataToSend);
    }

}


// Recieve data from the opponent, use this to update our game state
function gotData(data) {

    if (data.type === 'shipState') {
        if (data.timestamp > timestampLast) {
            if (data.playerID != playerID) {
                opponentShip.character = data.character;
                opponentShip.pos = createVector(data.posX, data.posY);
                opponentShip.rot = data.rot;
                opponentShip.rotVel = data.rotVel;
                opponentShip.vel = createVector(data.velX, data.velY);
                opponentShip.health = data.health;
                opponentShip.controlAccel = data.controlAccel;
                opponentShip.controlRot = data.controlRot;
                opponentShip.controlFire = data.controlFire;
                opponentShip.isCrashing = data.isCrashing;
                opponentShip.invincibility = data.invincibility;
                opponentShip.fireCooldown = data.fireCooldown;
                opponentShip.ultimate = data.ultimate;
            }
            timestampLast = data.timestamp;
        }

    }

    if (data.type === 'isFiring') {
        opponentShip.controlFire = data.isFiring;
    }

    if (data.type === 'obstacle') {

        // Find an existing obstacle with this id
        obstacle = null;
        for (var i = 0; i < MAX_OBSTACLES; i++) {
            if (obstacles[i].id == data.id) {
                obstacle = obstacles[i];
                break;
            }
        }

        if (obstacle == null) {  // This object ID not found, create it
            //id, pos, direction, weight, radius, health, sprite, isEnemy
            createObstacle(data.id, createVector(data.posX, data.posY), createVector(data.velX, data.velY), data.weight, data.radius, data.health, data.sprite, data.isEnemy, data.fireRate);


        } else {  // This obstacle was found, update it
            obstacle.active = data.active;
            obstacle.position = createVector(data.posX, data.posY);
            obstacle.velocity = createVector(data.velX, data.velY);
            obstacle.health = data.health;
            obstacle.weight = data.weight;
            obstacle.radius = data.radius;
            obstacle.sprite = data.sprite;
            obstacle.isEnemy = data.isEnemy;
            obstacle.shotCooldown = data.shotCooldown;
            obstacle.shotCount = data.shotCount;
            obstacle.fireRate = data.fireRate;
        }
    }

    if (data.type === 'destroyObstacle') {

        for (let obstacle of obstacles) {
            if (obstacle.id == data.id){
                if (data.explode){
                    obstacle.destroy();
                }else{
                    obstacle.deactivate();
                }
            }
        }

    }

    if (data.type === 'destroyTarget') {

        for (let target of targets) {
            if (target.id == data.id){
                target.destroy();
            }
        }

    }

    if (data.type === 'destroyBoss') {
        bossAlive = false;
    }

    if (data.type === 'ultimate') {

        opponentShip.ultimate = data.time;

        if (data.character == 0){
        }

        if (data.character == 1){
            ultimateNyx(opponentShip.playerID);
        }

        if (data.character == 2){
            // Nothing neede here
        }

    }

}




function getPeerIDFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('peerID');
}

