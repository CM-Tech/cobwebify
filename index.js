import "./styles.css";
import webShader from "./shaders/web.frag";
const regl = require('regl')()
const c = document.getElementById("c"),
  ctx = c.getContext("2d");
var mousePos = { x: 100, y: 100 };
var boidBeingDragged = null;
//mousePos.x==0
const colors = [
  [0, 255, 255],
  [255, 255, 0],
  [225, 0, 255],

  [100, 100, 255],
  [100, 255, 100],
  [225, 100, 100]
];

const s = 256 * 2;
c.width = s;
c.height = s;
const K = 120;
const boidSpeed = 10;
let boids = [];

function q(max) {
  return Math.random() * max;
}
function r(max = 255) {
  return Math.floor(q(max));
}
function rcolor() {
  return colors[r(colors.length)];
}
class Boid {
  constructor(x, y, vx, vy) {
    this.x = x;
    this.y = y;
    this.vx = vx * boidSpeed;
    this.vy = vy * boidSpeed;
    this.fx = 0;
    this.fy = 0;
    this.r = q(10) + 15;
    this.fillColor = [255, 255, 255];
    this.color = rcolor();
    this.colling = false;
  }
  move(tm) {
    var mrad = ((this.y - mousePos.y) ** 2 + (this.x - mousePos.x) ** 2) ** 0.5;
    // this.fy -= tm * (((this.y - mousePos.y) / mrad) * 10000) * this.r * this.r;
    // this.fx -= tm * (((this.x - mousePos.x) / mrad) * 10000) * this.r * this.r;
    this.fy += 100 * this.r * this.r; // * Math.sin(new Date().getTime() / 8000);
    // this.fx += 100 * this.r * this.r * Math.cos(new Date().getTime() / 8000);
    if (this.y > s || this.y < 0 || this.x > s || this.x < 0) {
      // this.r = q(10)+5;
    }

    if (this.y < this.r) {
      var dist2 = this.y;
      var rsum = this.r;
      let forceImpart = -(dist2 - rsum) * K * (this.r * this.r);
      this.fy += (-forceImpart * (0 - this.y)) / dist2;
    }
    //r
    // var rad = ((this.y - s / 2) ** 2 + (this.x - s / 2) ** 2) ** 0.5;
    // if (rad + this.r > s / 2) {
    //   var dist2 = rad;
    //   var rsum = this.r;
    //   let forceImpart = -(dist2 - rsum) * K * (this.r * this.r);
    //   this.fy += (forceImpart * (this.y - s / 2)) / rad / dist2;
    //   this.fx += (forceImpart * (this.x - s / 2)) / rad / dist2;
    // }

    if (size.h - this.y < this.r) {
      var dist2 = size.h - this.y;
      var rsum = this.r;
      let forceImpart = -(dist2 - rsum) * K * (this.r * this.r);
      this.fy += (-forceImpart * (size.h - this.y)) / dist2;
    }

    if (this.x < this.r) {
      var dist2 = this.x;
      var rsum = this.r;
      let forceImpart = -(dist2 - rsum) * K * (this.r * this.r);
      this.fx += (-forceImpart * (0 - this.x)) / dist2;
    }
    if (size.w - this.x < this.r) {
      var dist2 =size.w- this.x;
      var rsum = this.r;
      let forceImpart = -(dist2 - rsum) * K * (this.r * this.r);
      this.fx += (-forceImpart * (size.w - this.x)) / dist2;
    }

    this.vy += (this.fy / this.r / this.r) * tm;
    this.vx += (this.fx / this.r / this.r) * tm;
    this.fx = 0;
    this.fy = 0;
    this.y += this.vy * tm;
    this.x += this.vx * tm;
    // if(this.y < this.r ||this.y > s-this.r) this.vy = -Math.abs(this.vy)* Math.sign(this.y-s/2);
    // if (this.x < this.r || this.x > s-this.r) this.vx = -Math.abs(this.vx)* Math.sign(this.x-s/2);
  }
  bounce(tm) {
    var collidingNow = false;
    var n = true;
    for (let b of boids) {
      if (b === this) {
        n = false;
        continue;
      }
      let dist = Math.hypot(b.x - this.x, b.y - this.y);

      let rsum = b.r + this.r;
      if (dist < rsum) {
        var lk = tm * 0;
        let dist2 = Math.hypot(
          b.x - this.x - this.vx * lk + b.vx * lk,
          b.y - this.y - this.vy * lk + b.vy * lk
        );
        let dist3 = Math.hypot(-this.vx + b.vx, -this.vy + b.vy);

        var vm =
          ((b.x - this.x) * (-this.vx * this.r * this.r + b.vx * b.r * b.r) +
            (b.y - this.y) * (-this.vy * this.r * this.r + b.vy * b.r * b.r)) /
          dist;
        let forceImpart =
          (-(dist - rsum) * K * (this.r * this.r * b.r * b.r)) /
            (this.r * this.r + b.r * b.r) -
          3 * vm; //*(-(dist - rsum) );//*(-(dist - rsum));//((dist - rsum))*10;
        // let forceImpart2=-(dist3) * (this.r * this.r)/(this.r * this.r + b.r * b.r);
        let K2 = 0; //0;//100;
        this.fx +=
          (-forceImpart * (b.x - b.vx * 0 - this.x + this.vx * K2)) / dist;
        this.fy +=
          (-forceImpart * (b.y - b.vy * 0 - this.y + this.vy * K2)) / dist;
        // this.fx += (-forceImpart2 * (b.x - this.x)) / dist2;
        // this.fy += (-forceImpart2 * (b.y - this.y)) / dist2;
        collidingNow = true;
        if (!this.colliding && n) {
          [this.color, b.color] = [b.color, this.color];
        }
      }
    }
    this.colliding = collidingNow;
    var l = Math.pow(0.1, tm);
    for (var x = 0; x < 3; x++) {
      this.fillColor[x] = this.fillColor[x] * l + (1 - l) * this.color[x];
    }
  }
  draw() {
    let o = this.color;
    ctx.strokeStyle = "rgb(" + this.fillColor.join(",") + ")";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    ctx.stroke();
    // ctx.drawImage(
    //   document.getElementById("logo"),
    //   this.x - this.r,
    //   this.y - this.r,
    //   this.r * 2,
    //   this.r * 2
    // );
    // ctx.stroke();
  }
  draw2() {
    let o = this.color;
    // ctx.fillStyle = "rgb(" + this.fillColor.join(",") + ")";
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
    // ctx.fill();
    ctx.drawImage(
      document.getElementById("logo"),
      this.x - this.r,
      this.y - this.r,
      this.r * 2,
      this.r * 2
    );
    // ctx.stroke();
  }
}
for (let i = 0; i < ((s * s) / 512 / 512) * 40; i++) {
  boids.push(new Boid(q(s), q(s), q(2) - 1, q(2) - 1));
}
var input = document.getElementById("tex");
var size = {
  w: window.innerWidth,
  h: window.innerHeight
};
input.value = "Cobwebify is Amazing";

// input.onkeyup = change;
// input.onchange = change;
window.onresize = function() {
  size.w = window.innerWidth;
  size.h = window.innerHeight;
  c.width = size.w;
  c.height = size.h;
//   change();
};
size.w = window.innerWidth;
  size.h = window.innerHeight;
  c.width = size.w;
  c.height = size.h;

function physics(tm) {
  if (boidBeingDragged !== null) {
    var firstBoid = boidBeingDragged;
    firstBoid.vx += (mousePos.x - firstBoid.x) * 10 - firstBoid.vx / 2;
    firstBoid.vy += (mousePos.y - firstBoid.y) * 10 - firstBoid.vy / 2;
  }
  for (const b of boids) {
    b.bounce(tm);
  }
  for (const b of boids) {
    b.move(tm);
  }
}
let t = 0;
ctx.fillStyle = "black";
ctx.fillRect(0, 0, s, s);
var tex_canvas=regl.texture(c);
function draw(t2) {
  let delta = Math.min(t2 - t, 100);
  t = t2;
  for (var i = 0; i < 3; i++) physics(delta / 1500);

  // ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = `#00000040`; //hsl(${t2/10},100%,10%)`;

  ctx.fillRect(0, 0, size.w, size.h);

  // ctx.globalCompositeOperation = "multiply";
  ctx.filter = "blur(0px)";
  ctx.globalCompositeOperation = "default";
  for (const b of boids) {
    b.draw();
  }
  var txt=input.value;
  ctx.beginPath();
  ctx.font = "100px Arial";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "white";
  ctx.textAlign = "center";
  txt.split("\n").forEach(function(line, i) {
    ctx.strokeText(line, size.w / 2, (i + 1) * 100 + 60);
  });
//   ctx.filter = "";
//   ctx.globalCompositeOperation = "multiply"; //default
//   for (const b of boids) {
//     b.draw();
//   }
  ctx.globalCompositeOperation = "source-over"; //default
  ctx.strokeStyle = "#eee";
//   key();
  // ctx.beginPath();
  // ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
  // ctx.stroke();
  tex_canvas(c);
  window.requestAnimationFrame(draw);
}
draw(t);
function offset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}
window.addEventListener("mousemove", function(event) {
  var offsetC = offset(c);
  mousePos.x = event.clientX - offsetC.left;
  mousePos.y = event.clientY - offsetC.top;
});
function distance(a, b) {
  return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5;
}
window.addEventListener("mousedown", function(event) {
  var offsetC = offset(c);
  mousePos.x = event.clientX - offsetC.left;
  mousePos.y = event.clientY - offsetC.top;
  var closestBoid = null;
  var closestRadius = Infinity;
  for (const b of boids) {
    if (distance(b, mousePos) - b.r < closestRadius) {
      closestRadius = distance(b, mousePos) - b.r;
      closestBoid = b;
    }
  }
  if (closestRadius < 0) boidBeingDragged = closestBoid;
});
window.addEventListener("mouseup", function(event) {
  boidBeingDragged = null;
});

// Calling regl() creates a new partially evaluated draw command
const drawTriangle = regl({

    // Shaders in regl are just strings.  You can use glslify or whatever you want
    // to define them.  No need to manually create shader objects.
    frag: webShader,
  
    vert: `
      precision mediump float;
      attribute vec2 position;
      varying vec2 uv;
      void main() {
          uv=vec2(0.0,1.0)+(position.xy+vec2(1.0))*vec2(1.0,-1.0)/2.0;
        gl_Position = vec4(position, 0, 1);
      }`,
  
    // Here we define the vertex attributes for the above shader
    attributes: {
      // regl.buffer creates a new array buffer object
      position: regl.buffer([
        [-1,-1],   // no need to flatten nested arrays, regl automatically
        [3,-1],    // unrolls them into a typedarray (default Float32)
        [-1,3]
      ])
      // regl automatically infers sane defaults for the vertex attribute pointers
    },
  
    uniforms: {
      // This defines the color of the triangle to be a dynamic variable
      color: regl.prop('color'),
      canvas:()=>tex_canvas,
      resolution:()=>[size.w,size.h]
    },
  
    // This tells regl the number of vertices to draw in this command
    count: 3
  })
  
  // regl.frame() wraps requestAnimationFrame and also handles viewport changes
  regl.frame(({time}) => {
    // clear contents of the drawing buffer
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1
    })
  
    // draw a triangle using the command defined above
    drawTriangle({
      color: [
        Math.cos(time * 0.001),
        Math.sin(time * 0.0008),
        Math.cos(time * 0.003),
        1
      ]
    })
  })