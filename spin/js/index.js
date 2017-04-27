"use strict";
var c = document.getElementById("c");
var ctx = c.getContext("2d");
c.height = window.innerHeight;
c.width = window.innerWidth;

function drawPlanet(planet) {
    ctx.beginPath();
    ctx.arc(planet.origin.x, //x origin
    planet.origin.y, //y origin
    planet.radius, //radius
    0, Math.PI * 2, false);
    ctx.fillStyle = "rgba(200, 200, 200, 1)";
    ctx.fill();
}
function projectOnPlanet(planet, coord) {
    var rad = planet.radius + coord.z;
    var x = coord.x + planet.rot.x;
    var y = coord.y;
    var cx = rad * Math.sin(x) * Math.sin(y);
    var icy = rad * Math.cos(y);
    var icz = rad * Math.cos(x) * Math.sin(y);
    //do a cartesian rotation on the x axis for planet y rot
    var cy = icy * Math.cos(planet.rot.y) + icz * Math.sin(planet.rot.y);
    var cz = icz * Math.cos(planet.rot.y) - icy * Math.sin(planet.rot.y);
    return { x: cx, y: cy, z: cz };
}
function projectOnPlanetZInvert(planet, coord) {
    var _a = projectOnPlanet(planet, coord), x = _a.x, y = _a.y, z = _a.z;
    var rad = planet.radius + coord.z;
    if (z < 0) {
        var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var r_ = 2 * rad - r;
        x = (x / r) * r_;
        y = (y / r) * r_;
    }
    return { x: x, y: y, z: z };
}
function drawPathOnPlanet(planet, coords) {
    if (coords.length > 1) {
        ctx.beginPath();
        var next_1 = projectOnPlanetZInvert(planet, coords[0]);
        var resolve_1 = undefined;
        var resolveAtEnd_1 = undefined;
        coords.forEach(function (coord, i) {
            var cur = next_1;
            if (coords[i + 1] !== undefined)
                next_1 = projectOnPlanetZInvert(planet, coords[i + 1]);
            else
                next_1 = projectOnPlanetZInvert(planet, coords[0]);
            //do stuff here
            if (cur.z >= 0 && next_1.z >= 0) {
                ctx.lineTo(planet.origin.x + cur.x, planet.origin.y + cur.y);
            }
            else if (cur.z >= 0 && next_1.z <= 0) {
                ctx.lineTo(planet.origin.x + cur.x, planet.origin.y + cur.y);
                ctx.lineTo(planet.origin.x + next_1.x, planet.origin.y + next_1.y);
                resolve_1 = next_1;
            }
            else if (cur.z <= 0 && next_1.z >= 0) {
                if (resolve_1 === undefined)
                    resolveAtEnd_1 = cur;
                else {
                    //draw point between cur and resolve
                    var avg = {
                        x: (cur.x + resolve_1.x) / 2,
                        y: (cur.y + resolve_1.y) / 2
                    };
                    var r = Math.sqrt(Math.pow(avg.x, 2) + Math.pow(avg.y, 2));
                    var r_ = 2 * planet.radius;
                    avg.x = avg.x / r * r_;
                    avg.y = avg.y / r * r_;
                    ctx.lineTo(planet.origin.x + avg.x, planet.origin.y + avg.y);
                }
                ctx.lineTo(planet.origin.x + cur.x, planet.origin.y + cur.y);
            }
        });
        if (resolveAtEnd_1 !== undefined) {
            var avg = {
                x: (resolveAtEnd_1.x + resolve_1.x) / 2,
                y: (resolveAtEnd_1.y + resolve_1.y) / 2
            };
            var r = Math.sqrt(Math.pow(avg.x, 2) + Math.pow(avg.y, 2));
            var r_ = 2 * planet.radius;
            avg.x = avg.x / r * r_;
            avg.y = avg.y / r * r_;
            ctx.lineTo(planet.origin.x + avg.x, planet.origin.y + avg.y);
        }
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.fill();
    }
}
function drawCircleOnPlanet(planet, circle) {
    var _a = projectOnPlanet(planet, circle.coord), x = _a.x, y = _a.y, z = _a.z;
    if (z > 0) {
        ctx.beginPath();
        ctx.ellipse(planet.origin.x + x, //x origin
        planet.origin.y + y, //y origin
        Math.sin(Math.PI / 2 * Math.abs((rad - Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) / rad)) * circle.radius, //x radius
        circle.radius, //y radius
        Math.atan2(y, x), //rot
        0, Math.PI * 2, false); //how to draw a full ellipse.
        ctx.fill();
        ctx.stroke();
    }
}

var planet = {
    radius: c.width*2,
    origin: { x: c.width/2, y: c.height/2, z: 0 },
    rot: { x: -Math.PI/2+0.15, y: Math.PI/4 }
};
var paths = [americas_path, eastern_path, madagascar_path, australia_path, british_path, iceland_path, malaysia_path, japan_path, antarctic_path];

function draw() {
    
    drawPlanet(planet);

    paths.forEach(p=>drawPathOnPlanet(planet, p))

    ctx.beginPath();
    ctx.arc(
      planet.origin.x, //x origin
      planet.origin.y, //y origin
      planet.radius,   //radius
      0, Math.PI*2, false
    );
    ctx.fillStyle = "black";
    ctx.globalCompositeOperation = "destination-in";
    ctx.fill();
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle= "SeaGreen"
    ctx.fillRect(0,0,c.width,c.height);
    ctx.globalCompositeOperation = "source-over";
    
    planet.radius -= (planet.radius - 300) * 0.01;
    planet.rot.x -= 0.001;
    planet.rot.y -= 0.001;
    
    requestAnimationFrame(draw);
}
draw();
var offsetPrev = { x: 0, y: 0 };

var mouseDown = false;

c.addEventListener("mousedown", function() {
    mouseDown = true;
});

c.addEventListener("mouseup", function() {
    mouseDown = false;
});

c.addEventListener("mousemove", function (e) {
    console.log(e)
    if (mouseDown) {
        planet.rot.x -= (offsetPrev.x - e.offsetX) * 0.002;
        planet.rot.y -= (offsetPrev.y - e.offsetY) * 0.002;
    }
    offsetPrev.x = e.offsetX;
    offsetPrev.y = e.offsetY;
});