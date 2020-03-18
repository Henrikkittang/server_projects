
let invaders = [];
let cur_row = [];
let player_bullets = [];
let invader_bullets = [];
let invader_bullet_delay = 0;
let invader_row = [];
let walls = [];

class Defender {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.speed = 12;
        this.health = 3;
        this.score = 0;
    }

    draw(){
        fill(0, 255, 0);
        rect(this.x, this.y, 45, 20);
        rect(this.x + 15, this.y-10, 15, 10);

        // Health bar
        fill(255, 0, 0);
        rect(this.x, this.y + 25, 45, 5);


        fill(0, 255, 0);
        rect(this.x, this.y + 25, this.health*15, 5);
    }


    move(){

        if(keyIsDown(LEFT_ARROW) && this.x > 0){
            player.x -= player.speed;
        }
        else if(keyIsDown(RIGHT_ARROW) && this.x < width - 45){
            player.x += player.speed;
        }
    }
}

class Invader {
    constructor(x, y, row) {
        this.x = x;
        this.y = y;
        this.speed = 25;
        this.timer = 0;
        this.row = row;

    }

    draw(){
        fill(50, 210, 200);
        rect(this.x, this.y, 30, 30);
    }

    move(){
        if(this.timer < 50){
            this.timer++;
        }
        else{
            this.x += this.speed;
            this.timer = 0;
        }
    }
}

class Projectile {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.speed = 10*direction;
    }

    draw(){
        fill(255, 0, 0);
        rect(this.x, this.y, 5, 20);
    }

    move(){
        this.y -= this.speed;
    }
}

class Wall {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(){
        fill(0, 255, 0);
        rect(this.x, this.y, 10, 10);
    }
}

function createInvaders(){
    let temp_invader;
    for(let i = 20; i < 270; i += 50){
        for(let j = 50; j < 500; j += 50){
            temp_invader = new Invader(j, i, floor(j/50));
            invaders.push(temp_invader);
        }
    }
}

function createBase() {
    for(let i = 360; i < 420; i+=10){
        for(let j = 70; j < 220; j+=10){
            walls.push(new Wall(j, i));
        }
        for(let j = 325; j < 465; j+=10){
            walls.push(new Wall(j, i));
        }
        for(let j = 560; j < 710; j+=10){
            walls.push(new Wall(j, i));
        }
    }
}

function setup(){
    createCanvas(800, 500);

    player = new Defender(40, height - 50);
    createInvaders();
    createBase();

    //frameRate(80);

}

function keyPressed(){

    // if there are less than three player bullets on the screen,
    // then add another one
    if(keyCode === UP_ARROW && player_bullets.length < 3){
        let temp_projectile = new Projectile(player.x + 20, player.y-15, 1);
        player_bullets.push(temp_projectile);
    }

    if(key === "r" && player.health === 0){
        console.log("hmmm");
        restart = true;
    }
}

function draw(){
    background(51);
    player.draw();
    player.move();

    // If a bullet hit an invader, then remove the bullet and the invader
    for(let i = 0; i < player_bullets.length; i++){
        cur_bullet = player_bullets[i];
        cur_bullet.draw();
        cur_bullet.move();
        if(cur_bullet.y < 0){
            player_bullets.splice(i, 1);
        }
        for(let j = 0; j < invaders.length; j++){
            if(dist(cur_bullet.x + 2, cur_bullet.y + 2, invaders[j].x + 15, invaders[j].y + 15) < 20){
                invaders.splice(j, 1);
                player_bullets.splice(i, 1);
                player.score += 10;
            }
        }
    }

    // Draws and moves the invaders
    for(let i = 0; i < invaders.length; i++){
        invaders[i].draw();
        invaders[i].move();
    }

    // Chooses a random row of invader to shoot
    if(invader_bullet_delay > 30){
        let row = floor(random(1, 9));
        let pick = false
        while(pick === false){
            for(let i = 0; i < invaders.length; i++){
                if(row == invaders[i].row){
                    cur_row.push(invaders[i]);
                }
            }
            if(cur_row.length > 0){
                let last_invader = cur_row[cur_row.length-1];
                let new_bullet = new Projectile(last_invader.x+10, last_invader.y+20, -1)
                invader_bullets.push(new_bullet);
                pick = true;
            }
            else{
                row = floor(random(1, 9));
            }
        }
        invader_bullet_delay = 0;
    }

    rows = [];

    // Draws and moves the invader bullets
    for(let i = 0; i < invader_bullets.length; i++){
        invader_bullets[i].draw();
        invader_bullets[i].move();

        if(dist(invader_bullets[i].x, invader_bullets[i].y, player.x+22, player.y) < 22){
            invader_bullets.splice(i, 1);
            player.health -= 1;
        }

        else if(invader_bullets[i].y > height){
            invader_bullets.splice(i, 1);
        }
    }

    // Checks if the invaders has hit the edges
    for(let i = 0; i < invaders.length; i++){
        if(invaders[i].x > width - 60 || invaders[i].x < 40){
            for(let j = 0; j < invaders.length; j++){
                invaders[j].speed *= -1;
                invaders[j].y += 20;
                invaders[j].x += invaders[j].speed;
            }
        }
    }

    // Draws the walls and check if for invader bullet hit
    for(let i = 0; i < walls.length; i++){
        walls[i].draw();
        for(let j = 0; j < invader_bullets.length; j++){
            let bullet = invader_bullets[j];
            if(dist(bullet.x, bullet.y, walls[i].x+5, walls[i].y) < 9){
                invader_bullets.splice(j, 1);
                walls.splice(i, 1);
            }
        }
        // Checks if the players bullet has hit a wall
        for(let j = 0; j < player_bullets.length; j++){
            let bullet = player_bullets[j];
            if(dist(bullet.x, bullet.y, walls[i].x+5, walls[i].y) < 9){
                player_bullets.splice(j, 1);
                walls.splice(i, 1);
            }
        }
    }

    if(player.health <= 0){
        background(51);

        fill(255)
        textSize(46);
        textAlign(CENTER, CENTER);
        text('Game over', floor(width/2), floor(height/2));

        textSize(26);
        text('Your final score was ' + player.score , floor(width/2), floor(height/2) + 50);
        text('Press ENTER to restart', floor(width/2), floor(height/2) + 80);

        if(keyIsDown(ENTER)){
            invaders = [];
            cur_row = [];
            player_bullets = [];
            invader_bullets = [];
            invader_bullet_delay = 0;
            invader_row = [];
            walls = [];

            player.x = 40;
            player.y = height - 50;
            player.health = 3;
            player.score = 0;


            createInvaders();
            createBase();

            restart = false;
        }
    }
    invader_bullet_delay++;
    fill(255)
    textSize(16);
    textAlign(CENTER, CENTER);
    text('score: ' + player.score, 40, 20);

}


/**/
