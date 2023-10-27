// TODO: fix this
function drawStarfield(size) {
    // Set a fixed seed so that random numbers are consistent
    randomSeed(size);
  
    for (let i = 0; i < 250; i++) {
      let x = random(gameWidth - 10);
      let y = random(gameHeight - 10);
      let choice = floor(random(2));  // Choose either spriteStar1 or spriteStar2
  
      if (choice === 0) {
        image(spriteStar1, x, y, size, size);
      } else {
        image(spriteStar2, x, y, size+2, size+2);
      }
    }
  
  }
  
  
  // Draws rects around the edges of the game area so we can't see stuff rendered off there
  function drawBlinders(){
    fill (30, 10, 10);
    rect(-10000, -10000, 20000, 10000);
    rect(-10000, -10000, 10000, 20000);
    rect(gameWidth, -10000, 20000, 20000);
    rect(-10000, gameHeight, 20000, 20000);
  }
  