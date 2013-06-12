(function (window) {

  if (!allen.getAudioContext()) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('not-supported').style.display = 'block';
  }

  // Drawing
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var h = canvas.height;
  var w = canvas.width;
  var RADIUS = 2;

  ctx.globalCompositeOperation = 'lighter';

  // Audio
  var FILE = 'audio/song.' + (allen.canPlayType('mp3') ? 'mp3' : 'ogg');
  var audioContext = allen.getAudioContext();
  var bufferNode = audioContext.createBufferSource();
  var analyser = audioContext.createAnalyser();
  var fft = new Uint8Array(analyser.frequencyBinCount);
  bufferNode.connect(analyser);
  analyser.connect(audioContext.destination);

  allen.getBuffer(FILE, function (xhr) {
    bufferNode.buffer = audioContext.createBuffer(xhr.target.response, false);
    bufferNode[bufferNode.start ? 'start' : 'noteOn'](0);
    init();
  });


  function init () {
    var loadDiv = document.getElementById('loading');
    loadDiv.parentNode.removeChild(loadDiv);
    setInterval(function () {
      analyser.getByteFrequencyData(fft);
      draw();
    }, 50);
  }

  function draw () {
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < 512;) {
      drawFreq(fft[i], i / 22);
      i += 22;
    }
  }
  
  function drawFreq (value, pos) {
    var ovalCount = ~~(value / 12);
    var displacement = Math.abs(pos - 12) * 2;
    for (var i = 0; i < ovalCount; i++) {
      if (i < 2 && (pos < 2 || pos > 20)) { continue; }
      drawOval(pos * 13 + 5, h - displacement - (i * 8), colorMap(i));
    }
  }

  function colorMap (i) {
    if (i < 4)
      return '#6cab4e';
    if (i < 9)
      return '#ede938';
    if (i < 14)
      return '#f58326';
    return '#eb2726';
  }

  function drawOval (x, y, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI, false);
    ctx.fill();
  }
})(window);
