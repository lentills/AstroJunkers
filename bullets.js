
// We are using an object pool for the bullets
// When a bullet hits something or lives too long it is deactivated, and can be re-initialised when a new bullet is fired


const MAX_BULLETS = 200;    // Number of bullets maximum. More bullets will take longer to resolve collisions
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

        if (this.age > 2000){
          this.deactivate();    // Deactivate the bullet if it has lived too long without hitting anything
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


  // Draws all the active bullets in the pool
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

