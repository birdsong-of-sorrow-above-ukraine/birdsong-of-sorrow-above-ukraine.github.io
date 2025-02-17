let sketchBrush = function (p) {
  brush.instance(p);

  p.setup = function () {
    let container = document.getElementById('brush');
    if (!container) {
      console.error("Div with ID 'one' not found.");
      return;
    }

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    p.createCanvas(500, 200, p.WEBGL);
    p.pixelDensity(4);
    brush.load();

    let saveButton = p.createButton('Save Canvas');
    saveButton.position(10, 10);
    saveButton.mousePressed(() => p.save('canvas.png'));
  };

  p.draw = function () {
    p.translate(-p.width / 2, -p.height / 2);

    brush.pick('hatch_brush');
    brush.stroke('#dcb95f');
    brush.strokeWeight(4);

    const spacing = 0.05;
    const padding = 0;

    const lineCount = 200;

    for (let i = 0; i < lineCount; i++) {
      if (p.random(1) < 0.1) continue;

      let xStart = p.random(0, 10);
      let xEnd = p.width / 2 - p.random(0, 10);
      let y = p.map(i, 0, lineCount, 5, 30);

      let yStartOffset = p.random(-2, 2);
      let yEndOffset = p.random(-2, 2);

      brush.line(xStart, y + yStartOffset, xEnd, y + yEndOffset);
    }

    p.noLoop();
  };
};

new p5(sketchBrush, 'brush');
