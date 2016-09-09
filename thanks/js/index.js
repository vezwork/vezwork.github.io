var state = 0;

document.getElementById("cube").onclick = function() {
  document.getElementById("cube").style.transform = "rotateX(-20deg) rotateY(55deg) rotateZ(90deg)";

  setTimeout(function() {
    document.getElementById("top").style.transform = "rotateY(-90deg) translateZ(74px) translateY(-90px) rotateX(150deg)"
    document.getElementById("cube").style.top = "80%";

    document.getElementById("thanks").style.opacity = "1";
    document.getElementById("thanks").style.transform = "scale(1,1)";
  }, 1000);
  state = 1;
}
