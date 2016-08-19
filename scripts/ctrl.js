function initAudio() {
  return new Promise(function(resolve, reject) {
    navigator.getUserMedia  = navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia;

    if (navigator.getUserMedia) {

      window.AudioContext = window.AudioContext ||
                        window.webkitAudioContext;



      var audioContext = new AudioContext();

      navigator.getUserMedia({audio: true}, (stream) => {

        var mediaStreamSource = audioContext.createMediaStreamSource(stream);
        var meter = createAudioMeter(audioContext);
        mediaStreamSource.connect(meter);

        resolve(meter);

      }, ()=>{ reject("error") })
    }
  })
}

function initFire(canvasId, options={}) {
  options.clearColor = options.clearColor || [0.0, 0.0, 0.0, 0.0]
  options.camAngle = options.camAngle || 45
  options.camPos = options.camPos || [0.0, 0.5, 4.8]
  options.canvasSize = options.canvasSize || {height: 450, width: 450}
  options.uniforms = options.uniforms || [{ name: "dog", value: 0.01, type: "1f"}]


  var gl = newGLContext(canvasId, options.canvasSize.width, options.canvasSize.height);
  var context = new DrawingContext(gl);

  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(...options.clearColor);
  gl.blendFunc(gl.ONE, gl.ONE);
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);

  var projectionNode = new MatrixNode("projectionMatrix", function(matrix,
      context) {
    mat4.perspective(45, //camera angle?
        context.gl.viewportWidth / context.gl.viewportHeight,
        0.1,
        100.0,
        matrix);
    mat4.translate(matrix, options.camPos);
  })

  var cameraNode = new LookAtCameraNode(
      document.getElementById(canvasId), "modelViewMatrix");

  var modelViewNode = new MatrixNode("modelViewMatrix", function(mv) {
    //mat4.translate(mv, [0.0, 0.0, 5.0]);
  })

  var shaderNode = new ShaderNode("shader-vs", "shader-fs", [
      new TextureNode(0, "/textures/nzw.png", "nzw", gl.LINEAR, gl.REPEAT),
      new TextureNode(1, "/textures/firetex2.png", "fireProfile", gl.LINEAR,
          gl.CLAMP_TO_EDGE),
      new FunctionNode(function(context) {
        if (!this.time) this.time = 0;

        var time_loc = context.gl.getUniformLocation(
            context.getShaderProgram(), "time");
        this.time += context.timeDeltaMs;
        context.gl.uniform1f(time_loc, this.time / 1000.0);

        //var pinch_loc = context.gl.getUniformLocation(
        //  context.getShaderProgram(), "pinch");
        //context.gl.uniform1f(pinch_loc, pinch);


        for (var i = 0; i < options.uniforms.length; i++) {
          let loc = context.gl.getUniformLocation(
            context.getShaderProgram(), options.uniforms[i].name);
          context.gl["uniform"+options.uniforms[i].type](loc, options.uniforms[i].value);
        }
      })
    ]);

  var volumeNode = new SlicedCubeNode("modelViewMatrix", 0.05, "pos",
      [vec3.createFrom(-1.0, -2.0, -1.0),
       vec3.createFrom( 1.0, -2.0, -1.0),
       vec3.createFrom(-1.0,  2.0, -1.0),
       vec3.createFrom( 1.0,  2.0, -1.0),
       vec3.createFrom(-1.0, -2.0,  1.0),
       vec3.createFrom( 1.0, -2.0,  1.0),
       vec3.createFrom(-1.0,  2.0,  1.0),
       vec3.createFrom( 1.0,  2.0,  1.0)],
      "tex",
      [vec3.createFrom(0.0, 0.0, 0.0),
       vec3.createFrom(1.0, 0.0, 0.0),
       vec3.createFrom(0.0, 1.0, 0.0),
       vec3.createFrom(1.0, 1.0, 0.0),
       vec3.createFrom(0.0, 0.0, 1.0),
       vec3.createFrom(1.0, 0.0, 1.0),
       vec3.createFrom(0.0, 1.0, 1.0),
       vec3.createFrom(1.0, 1.0, 1.0)])

  // Constructing scene graph.
  shaderNode.children.push(projectionNode);
  projectionNode.children.push(cameraNode);
  cameraNode.children.push(modelViewNode);
  modelViewNode.children.push(volumeNode);

  gl.enable(gl.CULL_FACE);
  // Starting animation loop
  tick(shaderNode, gl, context);
}

function tick(root, gl, context) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  context.draw(root);
  if (!context.error) {
    window.requestAnimationFrame(function() {
      tick(root, gl, context);
    });
  }
}

function replaceBetween(str, start, end, what) {
  return str.substring(0, start) + what + str.substring(end);
};

function templateHTML(el, object=this) {
  var pos = 0;
  var text = el.innerHTML

  while(true) {
    var tempStart = text.indexOf('${', pos)
    if (tempStart == -1) break;
    var tempEnd = text.indexOf('}', tempStart)
    var varName = text.substring(tempStart+2, tempEnd).trim()
    if (object[varName]===undefined) throw "variable named (" + varName + ") in template does not exist in context!"
    text = replaceBetween(text, tempStart, tempEnd+1, object[varName])
    pos = tempEnd+1
  }
  el.innerHTML = text
}
