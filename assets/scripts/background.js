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

    p.createCanvas(720, 400, p.WEBGL);
    p.pixelDensity(4);
    brush.load();

    let saveButton = p.createButton('Save Canvas');
    saveButton.position(10, 10);
    saveButton.mousePressed(() => p.save('canvas.png'));
  };

  p.draw = function () {
    p.background('#F9EFE9');
    p.translate(-p.width / 2, -p.height / 2);

    brush.pick('hatch_brush');
    brush.stroke('#424992');
    brush.strokeWeight(1);

    const spacing = 0.05;
    const padding = 0;

    for (let i = padding; i < p.height - 10; i += spacing) {
      if (p.random(1) < 0.3) {
        continue;
      }

      let xStart, xEnd;

      xStart = p.random(0, 10);
      xEnd = p.width - p.random(0, 10);

      let yStartOffset = 0;
      let yEndOffset = -5;

      if (p.random(1) < 0.3) {
        yStartOffset = p.random(-spacing / 3, spacing / 3);
        yEndOffset = p.random(-spacing / 3, spacing / 3) + p.random(5);
      }

      brush.line(xStart, i + yStartOffset, xEnd, i + yEndOffset);
    }

    p.noLoop();
  };
};

new p5(sketchBrush, 'brush');
