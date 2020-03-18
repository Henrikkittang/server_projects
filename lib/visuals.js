
class Canvas{
    constructor(){
        this.canvas = document.createElement('canvas');
        this.canvas.setAttribute('id', 'myCanvas')
        document.body.append(this.canvas);
    }
}

function toDegrees(radians){
  return radians * (180/Math.PI);
}

function toRadians(degrees){
    return degrees * (Math.PI / 180);
}

class Vector{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    add(vec){
        this.x += vec.x;
        this.y += vec.y;
    }
    sub(vec){
        this.x -= vec.x;
        this.y -= vec.y;
    }
    length(){
        return Math.sqrt( Math.pow(this.x, 2) + Math.pow(this.y, 2) );
    }
    dotProduct(vec){
        return (this.x * vec.x) + (this.y * vec.y);
    }
    angle(vec){
        const scalar = this.dotProduct(vec);
        const legnth_prod = vec.length() * this.length();
        const radians = Math.acos( scalar / legnth_prod )
        return toDegrees(radians);
    }
}

class Visuals{
    constructor(w, h, color){
        const tempCanvas = new Canvas();
        this.canvas = document.getElementById('myCanvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        if(color) this.fillCanvas(color);
    }   x

    fillCanvas(color){
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    rect(x, y, w, h, color='black'){
        this.context.fillStyle = color;
        this.context.fillRect(x, y, w, h);
    }
    ellipse(x, y, r1, r2, color='black'){
        this.context.beginPath();
        this.context.ellipse(x, y, r1, r2, 0, 0, Math.PI * 2);
        this.context.fillStyle = color;
        this.context.fill();
    }
    circle(x, y, r, color='black'){
        this.context.beginPath();
        this.context.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
        this.context.fillStyle = color;
        this.context.fill();
    }
    line(x1, y1, x2, y2, color='black', lineWidth=1){
        this.context.beginPath();
        this.context.strokeStyle  = color;
        this.context.lineWidth = lineWidth;
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }
    dist(x1, y1, x2, y2){
        return Math.sqrt( Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2) );
    }
}




