var input = document.getElementById("tex");
var c = document.getElementById("c");
var ctx = c.getContext("2d");
var size = {
  w: window.innerWidth,
  h: window.innerHeight
};
var pixels = [];
var edgePoints = [];
c.width = size.w;
c.height = size.h;
input.value = "It works";
var raylength = 20; //distance before ray is destroyed
var cpp = 3; //amount of times a pixel should send a ray
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
    if (pixels[Math.floor(cY)][Math.floor(cX)]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(cX, cY);
      ctx.stroke();
      return true; //indicates hit
    }
  }
}

function setupPixels(txt) {
  ctx.beginPath();
  ctx.font = "100px Arial";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "white";
  ctx.textAlign = "center";
  txt.forEach(function(line, i) {
    ctx.strokeText(line, size.w / 2, (i + 1) * 100 + 60);
  });

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

function setup(txt) {
  //create an array of pixels witht the bodrer of the text
  setupPixels(fragmentText(txt, size.w));
  for (var i = 0; i < 225 * txt.length; i++) {
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
