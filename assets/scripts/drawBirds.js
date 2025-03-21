let drawBirds = function (p, containerId, params) {
  let birdsDrawn = 0;
  let birdPositions = [];

  const { number, sizeRange, color, exclusionZonesIds = [] } = params;
  params.exclusionZones = [];

  p.setup = function () {
    const canvasContainer = document.getElementById(containerId);
    const canvasWidth = canvasContainer.clientWidth;
    const canvasHeight = canvasContainer.clientHeight;
    p.createCanvas(canvasWidth, canvasHeight);

    params.exclusionZones = exclusionZonesIds
      .map((id) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const containerRect = canvasContainer.getBoundingClientRect();
          const exclusionZone = {
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            w: rect.width,
            h: rect.height,
          };

          return exclusionZone;
        }
        return null;
      })
      .filter(Boolean);
  };

  p.draw = function () {
    if (p.frameCount % 10 === 0 && birdsDrawn < number) {
      let x, y, size, isOverlapping;

      do {
        x = p.random(20, p.width - 20);
        y = p.random(20, p.height - 20);
        size = p.random(sizeRange.min, sizeRange.max);

        isOverlapping = params.exclusionZones.some(
          (zone) =>
            x > zone.x &&
            x < zone.x + zone.w &&
            y > zone.y &&
            y < zone.y + zone.h
        );

        for (let i = 0; i < birdPositions.length; i++) {
          const bird = birdPositions[i];
          const distance = p.dist(x, y, bird.x, bird.y);
          if (distance < (size + bird.size) / 2 + 5) {
            isOverlapping = true;
            break;
          }
        }
      } while (isOverlapping);

      p.noStroke();
      // p.rotate(p.random(-0.3, 0.3));
      BirdShapes.bird(p, x, y, size, color);
      birdPositions.push({ x, y, size });
      birdsDrawn++;
    }

    if (birdsDrawn >= number) {
      p.noLoop();
    }
  };
};
