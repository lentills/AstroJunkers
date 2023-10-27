const MAX_BULLETS = 200;
let bullets = [];

class Bullet {
    constructor() {
      this.active = false;
      this.position = createVector(0, 0);
      this.velocity = createVector(0, 0);
      this.age = 0;
    }
  
    update() {
      if (this.active) {
        this.position.add(this.velocity);
        this.age += deltaTime;
        if (this.age > 1000){
          this.deactivate();
        }
      }
    }
  
    fire(pos, vel) {
      this.active = true;
      this.position = pos.copy();
      this.velocity = vel.copy();
      this.age = 0;
    }
  
    deactivate() {
      this.active = false;
    }
  }
  
  // Find an inactive bullet and fire it
  function fireBullet(pos, direction) {
    for (let bullet of bullets) {
      if (!bullet.active) {
        bullet.fire(pos, direction);
        break;
      }
    }
  }



  function drawBullets(){
    for (let bullet of bullets) {
      if (bullet.active) {
        push();
        translate(bullet.position.x, bullet.position.y);
        rotate(bullet.velocity.heading()+90 );
        image(spriteBullet, 0, 0, 4, 10);
        pop();
      }
    }
  }

