var input = document.getElementById("tex");
var c = document.getElementById("c");
var ctx = c.getContext("2d");
var size = {
  w: window.innerWidth,
  h: window.innerHeight
};
var balls = [];

function ball(x, y) {
  this.x = x;
  this.y = y;
  this.vx = 0;
  this.vy = 0;
  this.move = function() {
    this.vy += 0.5;
    if (this.y + 20 > size.h) {
      this.y = size.h - 20;
      this.vy = -Math.abs(this.vy);
    }
    if (this.x + 20 > size.w) {
      this.x = size.x - 20;
      this.vx = -Math.abs(this.vx);
    }
    if (this.x - 20 < 0) {
      this.x = 20;
      this.vx = Math.abs(this.vx);
    }
    this.x += this.vx;
    this.y += this.vy;
    this.vx = this.vx * 0.95;
    this.vy = this.vy * 0.95;
  };
  return this;
}
var pixels = [];
var edgePoints = [];
c.width = size.w;
c.height = size.h;
for (var i = 0; i < 10; i++) {
  balls.push(new ball(Math.random() * size.w, Math.random() * size.h));
}
input.value = "(◉_◉)";
var raylength = 20; //distance before ray is destroyed
var cpp = 3; //amount of times a pixel should send a ray
var textSize = 100;

function fragmentText(text, maxWidth) {
  var words = text.split(' '),
    lines = [],
    line = "";
  if (ctx.measureText(text).width < maxWidth) {
    return [text];
  }
  while (words.length > 0) {
    while (ctx.measureText(words[0]).width >= maxWidth) {
      var tmp = words[0];
      words[0] = tmp.slice(0, -1);
      if (words.length > 1) {
        words[1] = tmp.slice(-1) + words[1];
      } else {
        words.push(tmp.slice(-1));
      }
    }
    if (ctx.measureText(line + words[0]).width < maxWidth) {
      line += words.shift() + " ";
    } else {
      lines.push(line);
      line = "";
    }
    if (words.length === 0) {
      lines.push(line);
    }
  }
  return lines;
}

function raycast(x, y, dir) {

  var dirX = Math.sin(dir);
  var dirY = Math.cos(dir);
  var cX = x;
  var cY = y;
  for (var i = 0; i < raylength; i++) {
    cX += dirX;
    cY += dirY;
    if (Math.floor(cY) > 0 && Math.floor(cY) < pixels.length && Math.floor(cX) > 0 && Math.floor(cX) < pixels[0].length) {
      if (pixels[Math.floor(cY)][Math.floor(cX)]) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(cX, cY);
        ctx.stroke();
        return true; //indicates hit
      }
    }
  }
}

function setupPixels(txt) {
  ctx.clearRect(0, 0, size.w, size.h);
  ctx.beginPath();
  ctx.font = "100px Arial";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "white";
  ctx.textAlign = "center";
  txt.forEach(function(line, i) {
    ctx.strokeText(line, size.w / 2, (i + 1) * 100 + 60);
  });
  for (var i = 0; i < balls.length; i++) {
    ctx.beginPath();
    ctx.arc(balls[i].x, balls[i].y, 20, 0, Math.PI * 2, true);
    ctx.stroke();
  }
  pixels = [];
  var ctext = ctx.getImageData(0, 0, size.w, size.h);
  var pixtext = ctext.data;
  for (var i = 0; i < pixtext.length; i += 4) {
    //make row
    if ((i / 4) % size.w === 0) {
      pixels[Math.floor(i / 4 / size.w)] = [];
    }

    // having inequality over half opacity gives
    //best result because of antialising

    if (255 / 2 < pixtext[i + 3]) {
      edgePoints.push({
        x: (i / 4) % size.w,
        y: Math.floor(i / 4 / size.w)
      });
      pixels[Math.floor(i / 4 / size.w)][(i / 4) % size.w] = true;
    } else {
      pixels[Math.floor(i / 4 / size.w)][(i / 4) % size.w] = false;
    }
  }
}

function tick() {
  for (var i = 0; i < balls.length; i++) {
    balls[i].move();
  }
  key();
}
window.setInterval(tick, 1);

function setup(txt) {
  //create an array of pixels witht the bodrer of the text
  setupPixels(fragmentText(txt, size.w));

  for (var i = 0; i < 0.5 * edgePoints.length; i++) {
    var edgePoint = edgePoints[Math.floor(Math.random() * edgePoints.length)];

    for (var j = 0; j < cpp; j++) {
      var dir = Math.random() * Math.PI * 2;
      var hit = raycast(edgePoint.x, edgePoint.y, dir);
    }
  }
}
setup(input.value);

function key() {
  pixels = [];
  edgePoints = [];
  ctx.clearRect(0, 0, size.w, size.h);
  setup(input.value);

}
input.onkeyup = key;
input.onchange = key;
window.onresize = function() {
  size.w = window.innerWidth;
  size.h = window.innerHeight;
  c.width = size.w;
  c.height = size.h;
  key();
};
