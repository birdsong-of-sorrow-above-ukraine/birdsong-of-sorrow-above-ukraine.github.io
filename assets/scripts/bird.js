let BirdShapes = {};

BirdShapes.bird = function (p, x, y, size, color, wingsOption = null) {
  p.fill(color);
  p.beginShape();

  // Top wing curve
  p.vertex(x - size / 2, y);
  p.bezierVertex(
    x - size / 4,
    y - size / 8,
    x + size / 4,
    y - size / 8,
    x + size / 2,
    y
  );

  // Bottom wing curve
  p.bezierVertex(
    x + size / 4,
    y + size / 8,
    x - size / 4,
    y + size / 8,
    x - size / 2,
    y
  );

  p.endShape(p.CLOSE);

  // Determine wingsOption: Use the provided value or generate randomly
  wingsOption = wingsOption !== null ? wingsOption : p.floor(p.random(1, 4));

  if (wingsOption === 1 || wingsOption === 3) {
    // Draw the top wing detail
    p.beginShape();
    p.vertex(x, y);
    p.bezierVertex(
      x - size / 3,
      y - size / 4,
      x + size / 3,
      y - size / 2,
      x + size / 2,
      y - size / 3
    );
    p.vertex(x, y);
    p.endShape(p.CLOSE);
  }

  if (wingsOption === 2 || wingsOption === 3) {
    // Draw the bottom wing detail
    p.beginShape();
    p.vertex(x, y);
    p.bezierVertex(
      x - size / 3,
      y + size / 4,
      x + size / 3,
      y + size / 2,
      x + size / 2,
      y + size / 3
    );
    p.vertex(x, y);
    p.endShape(p.CLOSE);
  }
};
