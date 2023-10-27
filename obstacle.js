
const MAX_OBSTACLES = 100;
let obstacles = [];


class Obstacle {

    constructor() {
      this.active = false;
      this.position = createVector(0, 0);
      this.velocity = createVector(0, 0);
      this.age = 0;
      this.health = 100;
      this.size = 1;
      this.sprite = null;
    }
  
    update() {
      if (this.active) {
        this.position.add(this.velocity);
        this.age += deltaTime;

        if (this.health < 0){
          this.deactivate();
        }

      }
    }
  
    create(pos, vel, size, health, sprite) {
      this.active = true;
      this.position = pos.copy();
      this.velocity = vel.copy();
      this.age = 0;
      this.health = health;
      this.size = size;
      this.sprite = sprite;
    }
  
    deactivate() {
      this.active = false;
    }
  }
  
  
  // Find an inactive bullet and fire it
  function createObstacle(pos, direction, size, health, sprite) {
    for (let obstacle of obstacles) {
      if (!obstacle.active) {
        obstacle.create(pos, direction, size, health, sprite);
        break;
      }
    }
  }

  

  function drawObstacle(obstacle){
    push();
    translate(obstacle.position.x, obstacle.position.y);
    //rotate(obstacle.velocity.heading()+90 );
    image(obstacle.sprite, 0, 0, 4, 10);
    pop();
  }



