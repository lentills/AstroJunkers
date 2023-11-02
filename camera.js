
var cameraAgility = 1;  // How quickly should the camera move to chase the player ship? around 1.0 seems to be good
var cameraPos, cameraVel, cameraZoom, cameraZoomSpeed;

// Moves the camera to follow the ship.
// Follows the point slightly ahead of the vector the ship is travelling in
// Introduces a bit of dampening to make the ship feel faster
function moveCameraDamped() {
    let dampeningFactor = 0.95;
    cameraVel.lerp(playerShip.vel, 1 - dampeningFactor);
    
    let offset = createVector(cameraVel.x * 0.5, -cameraVel.y * 0.5);
    let targetPoint = p5.Vector.add(playerShip.pos, offset);
  
    //fill(255, 0, 0);
    //rect(targetPoint.x, targetPoint.y, 5, 5);     // Used to view the position of the target point. Comment this out for production
  
    let ease = (t) => t * t * (3 - 2 * t);  // Simple easeInOut function. You can replace with other easing functions.
    let easedAgility = ease(cameraAgility * deltaTime * 0.01);
    cameraPos.lerp(targetPoint, easedAgility);
    //cameraPos = playerShip.pos.copy();
  
    if (p5.Vector.sub(cameraPos, targetPoint).mag() > 300){ // If the camera gets super far away (sometimes happens when tabbing out) move it back
      cameraPos = targetPoint.copy();
    }
  
    // Control camera zoom based on speed
    cameraZoomSpeed = cameraZoom - map(playerShip.vel.mag() / characterStats[playerShip.character].maxSpeed, 0, 1, 2, 1.5);
    cameraZoom -= cameraZoomSpeed * deltaTime * 0.0003;
  
    // Limit the camera position between these two bounds
    if (cameraZoom > 3){cameraZoom = 3;}
    if (cameraZoom < 1){cameraZoom = 1;}
  }

