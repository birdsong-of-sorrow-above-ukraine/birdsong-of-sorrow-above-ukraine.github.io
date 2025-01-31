let legend = function (p, containerId, n) {
  let birdsDrawn = 0;
  let birdPositions = [];

  p.setup = function () {
    const canvasContainer = document.getElementById(containerId);
    const canvasWidth = canvasContainer.clientWidth;
    const canvasHeight = canvasContainer.clientHeight;
    p.createCanvas(canvasWidth, canvasHeight);

    p.noLoop(); // Only draw once
  };

  p.draw = function () {
    const lightBlueBirds = 2; // Number of light blue birds
    while (birdsDrawn < n) {
      let x, y, size, isOverlapping;

      // Define the text areas to avoid
      const textAreas = [
        {
          x: 60 - 16,
          y: 60 - 8,
          w: 230 + 32,
          h: 30 + 16,
        }, // Top text area
        {
          x: 270 - 32,
          y: 140 - 8,
          w: 270 + 32 + 32,
          h: 32 + 16,
        }, // Bottom text area
      ];

      do {
        x = p.random(50, p.width - 50); // Generate random x-coordinate
        y = p.random(50, p.height - 50); // Generate random y-coordinate
        size = p.random(10, 30); // Random bird size

        // Check for overlap with text areas
        isOverlapping = textAreas.some(
          (area) =>
            x > area.x &&
            x < area.x + area.w &&
            y > area.y &&
            y < area.y + area.h
        );

        // Check for overlap with existing birds
        for (let i = 0; i < birdPositions.length; i++) {
          const bird = birdPositions[i];
          const distance = p.dist(x, y, bird.x, bird.y);
          if (distance < (size + bird.size) / 2 + 5) {
            isOverlapping = true;
            break;
          }
        }
      } while (isOverlapping);

      // Choose bird color
      const birdColor = birdsDrawn < lightBlueBirds ? '#7B86FF' : '#424992'; // Light blue for first 2 birds, white for others

      // Draw the bird
      p.noStroke();
      BirdShapes.bird(p, x, y, size, birdColor);
      birdPositions.push({ x, y, size });
      birdsDrawn++;
    }
  };
};
