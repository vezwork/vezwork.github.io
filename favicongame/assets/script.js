const t = document.getElementsByTagName("title")[0]


const c = document.getElementById("c")
const ctx = c.getContext("2d")

const pos = { x: 0, y: 0 }
let hp = 3
t.text = "hp: " + hp
const keys = { up: false, down: false, left: false, right: false }

document.addEventListener("keydown", e=>setKeys(e,true))

document.addEventListener("keyup", e=>setKeys(e,false))

function setKeys(e, val) {
    if (e.key === "ArrowDown") {
        keys.down = val
    } else if (e.key === "ArrowUp") {
        keys.up = val
    } else if (e.key === "ArrowLeft") {
        keys.left = val
    } else if (e.key === "ArrowRight") {
        keys.right = val
    } if (val && e.key == "a") {
        hp--
        t.text = "hp: " + hp
    }
}

function move() {
    if (keys.up === true) {
        pos.y-=0.1
    }
    if (keys.down === true) {
        pos.y+=0.1
    }
    if (keys.left === true) {
        pos.x-=0.1
    }
    if (keys.right === true) {
        pos.x+=0.1
    }
}

function draw() {
    move()
    ctx.clearRect(0,0,c.width,c.height)
    ctx.fillStyle = "red"
    ctx.fillRect(pos.x,pos.y,3,3)
    newFavicon()
    requestAnimationFrame(draw)
}

draw()

function newFavicon() {
    var link = document.querySelector("link[rel*='icon']");
    link.href = c.toDataURL();
}