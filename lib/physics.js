

class Physics{
    constructor(){
        this.laws = {
            gravity: 10
        }
    }
    pixelCollision(hitbox1, hitbox2){
        if(hitbox1.x + hitbox1.w > hitbox2.x && hitbox1.x < hitbox2.x + hitbox2.w){
            if(hitbox1.y > hitbox2.y && hitbox1.y < hitbox2.y + hitbox2.h){
                return true;
            }
        }   
    }
    applyGravity(body){
        body.instance.hitbox.y += Math.pow(body.fallCount, 2) * 0.5
        body.fallCount += 0.45;
    }
}

class World{
    constructor(){
        this.bodies = []
        this.physics = new Physics();
    }
    addBody(instance){
        console.log('Hello');

        const body = {
            instance: instance,
            fallCount: 2,
        }
        this.bodies.push(body);
    }
    removeBody(body){
        const idx = this.bodies.indexOf(body);
        this.bodies.splice(idx, 1);
    }
    update(){
        console.log(this.bodies.length);
        this.physics.applyGravity(this.bodies[0]);
    }
}






