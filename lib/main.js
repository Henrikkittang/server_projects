
class Test{
    constructor(){
        this.hitbox = {
            x: 50,
            y: 50,
            w: 100,
            h: 100
        }
    }
    draw(){
        visuals.rect(this.hitbox.x, this.hitbox.y, this.hitbox.w, this.hitbox.h);
    }
}


const visuals = new Visuals(500, 500, 'lightgrey');
const world = new World();

const myTest = new Test();
world.addBody(myTest);

function draw(){
    visuals.fillCanvas('lightgrey');
    world.update();
    myTest.draw();
}

setInterval(() => {
    draw();
}, 25);
