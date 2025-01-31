let outro = function (p, containerId, n) {
  let birdsDrawn = 0;
  let birdPositions = [];
  const gridCols = 4;
  const gridRows = 3;

  const regionWeights = {
    3: 5,
    4: 5,
    6: 1,
    7: 4,
    10: 2,
    11: 5,
    12: 1,
  };

  const weightedRegions = Object.entries(regionWeights).flatMap(
    ([region, weight]) => Array(weight).fill(parseInt(region))
  );

  p.setup = function () {
    const canvasContainer = document.getElementById(containerId);
    p.createCanvas(canvasContainer.clientWidth, canvasContainer.clientHeight);
  };

  p.draw = function () {
    if (birdsDrawn < n) {
      const region = p.random(weightedRegions);
      const { x, y } = getCoordinatesForRegion(region, p.width, p.height);

      if (!isOverlapping(x, y)) {
        drawBird(x, y, p);
        birdsDrawn++;
      }
    } else {
      p.noLoop();
    }
  };

  function getCoordinatesForRegion(region, canvasWidth, canvasHeight) {
    const cellWidth = canvasWidth / gridCols;
    const cellHeight = canvasHeight / gridRows;

    const col = (region - 1) % gridCols;
    const row = Math.floor((region - 1) / gridCols);

    return {
      x: p.random(col * cellWidth, (col + 1) * cellWidth),
      y: p.random(row * cellHeight, (row + 1) * cellHeight),
    };
  }

  function isOverlapping(x, y) {
    return birdPositions.some(
      (bird) => p.dist(x, y, bird.x, bird.y) < (bird.size || 15) + 5
    );
  }

  function drawBird(x, y, p) {
    const size = p.random(10, 30);
    p.noStroke();
    BirdShapes.bird(p, x, y, size, '#424992');
    birdPositions.push({ x, y, size });
  }
};
