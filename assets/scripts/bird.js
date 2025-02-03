let BirdShapes = {};

BirdShapes.bird = function (p, x, y, size, color, wingsOption = null) {
  p.fill(color);
  p.beginShape();

  p.vertex(x - size / 2, y);
  p.bezierVertex(
    x - size / 4,
    y - size / 8,
    x + size / 4,
    y - size / 8,
    x + size / 2,
    y
  );

  p.bezierVertex(
    x + size / 4,
    y + size / 8,
    x - size / 4,
    y + size / 8,
    x - size / 2,
    y
  );

  p.endShape(p.CLOSE);

  wingsOption = wingsOption !== null ? wingsOption : p.floor(p.random(1, 4));

  if (wingsOption === 1 || wingsOption === 3) {
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
