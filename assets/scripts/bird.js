let BirdShapes = {};

BirdShapes.bird = function (
  p,
  x,
  y,
  size,
  color,
  wingsOption = null,
  mirrorX = null,
  rotationAngle = null
) {
  p.push();
  p.translate(x, y);

  mirrorX = mirrorX !== null ? mirrorX : p.random() > 0.5;

  rotationAngle = rotationAngle !== null ? rotationAngle : p.random(-30, 30);

  let scaleX = mirrorX ? -1 : 1;
  p.scale(scaleX, 1);
  p.rotate(p.radians(rotationAngle));

  p.fill(color);

  p.beginShape();
  p.vertex(-size / 2, size / 5);
  p.bezierVertex(
    size / 3,
    -size / 6,
    size / 0.6,
    -size / 6,
    -p.random(size / 5, size / 2),
    p.random(size / 4, size / 3)
  );
  p.vertex(-size / 2, size / 5);
  p.endShape(p.CLOSE);

  wingsOption = wingsOption !== null ? wingsOption : p.floor(p.random(1, 3));

  if (wingsOption === 1) {
    // First wing style
    p.beginShape();
    p.vertex(-size / 2, -size / 2);
    p.quadraticVertex(size / 2, -size / 2, size / 1.5, size / 1.5);
    p.endShape(p.CLOSE);
  }

  if (wingsOption === 2) {
    p.beginShape();
    p.vertex(-size / 1.5, 0);
    p.quadraticVertex(0, -size / 2, size / 1.5, 0);
    p.endShape(p.CLOSE);

    p.push();
    p.rotate(p.radians(40));
    p.beginShape();
    p.vertex(-size / 1.5, 0);
    p.quadraticVertex(0, -size / 1.7, size / 2, -size / 2.5);
    p.endShape(p.CLOSE);
    p.pop();
  }

  p.pop();
};
