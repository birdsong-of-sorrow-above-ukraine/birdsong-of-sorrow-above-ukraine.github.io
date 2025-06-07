let sketchBrush = function (p) {
  brush.instance(p);

  const verticalSpacing = 1;
  const linesPerRow = 20;
  const lineProbability = 0.5;
  const slopeRange = 13;
  const minWidth = 100;
  const maxWidth = 500;
  p.setup = function () {
    let container = document.getElementById('brush');
    p.createCanvas(975, 512, p.WEBGL);
    p.pixelDensity(4);
    brush.load();

    let saveButton = p.createButton('Save Canvas');
    saveButton.position(10, 10);
    saveButton.mousePressed(() => p.save('canvas.png'));
  };

  p.draw = function () {
    p.background('#fff');
    p.translate(-p.width / 2, -p.height / 2);

    brush.pick('HB');
    brush.stroke('#424992');
    brush.strokeWeight(1);

    for (let y = 16; y < p.height - 16; y += verticalSpacing) {
      for (let j = 0; j < linesPerRow; j++) {
        if (p.random(1) > lineProbability) continue;

        const xStart = p.random(10, 20);
        const xStart2 = p.random(p.width - 10, p.width - 20);
        const lineWidth = p.random(minWidth, maxWidth);

        const xEnd =
          Math.min(xStart + lineWidth, p.width - 10) - p.random(2, 24);
        const xEnd2 = Math.min(xStart2 - lineWidth, 10) + p.random(10, 20);

        const yStart = y + p.random(-1, 1);
        const yEnd2 = y + p.random(-1, 1);
        const yEnd = y + p.random(-1, 1) + p.random(-slopeRange, slopeRange);
        const yStart2 = y + p.random(-1, 1) + p.random(-slopeRange, slopeRange);

        brush.line(xStart, yStart, xEnd, yEnd);
        brush.line(xStart2, yStart2, xEnd2, yEnd2);
      }
    }

    p.noLoop();
  };
};

new p5(sketchBrush, 'brush');
