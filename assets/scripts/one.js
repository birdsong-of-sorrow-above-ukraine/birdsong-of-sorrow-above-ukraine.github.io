let oneSketch = function (p) {
  let monthHeight = 400;
  const xPadding = 30;
  let font, csvData;
  let birds = [];
  let months = [];
  let exclusionZones = [];
  let images = [];

  p.preload = function () {
    for (let i = 1; i <= 12; i++) {
      let filename = i.toString().padStart(2, '0') + '.png';
      let path = `./assets/images/bg/${filename}`;
      images.push(p.loadImage(path));
    }

    csvData = p.loadTable(
      './assets/data/civilian_casualties.csv',
      'csv',
      'header'
    );
  };

  p.setup = function () {
    let canvasHeight = monthHeight * csvData.rows.length;

    let container = document.getElementById('one');
    if (container) {
      let canvasWidth = container.offsetWidth;
      p.createCanvas(canvasWidth, canvasHeight, p.WEBGL);
    } else {
      console.error("Div with ID 'one' not found.");
      p.createCanvas(p.windowWidth, canvasHeight, p.WEBGL);
    }

    p.angleMode(p.DEGREES);
    initializeBirds();

    p.noLoop();
  };

  function isInsideRect(x, y, zone) {
    return (
      x >= zone.x &&
      x <= zone.x + zone.width &&
      y >= zone.y &&
      y <= zone.y + zone.height
    );
  }

  function isInsideBufferZone(x, y, zone, bufferSize) {
    return (
      x >= zone.x - bufferSize &&
      x <= zone.x + zone.width + bufferSize &&
      y >= zone.y - bufferSize &&
      y <= zone.y + zone.height + bufferSize &&
      !isInsideRect(x, y, zone)
    );
  }

  function isInsideExclusionZoneOrBuffer(x, y) {
    for (const zone of exclusionZones) {
      if (isInsideRect(x, y, zone)) {
        return 'exclusion';
      }
      if (isInsideBufferZone(x, y, zone, 50)) {
        return 'buffer';
      }
    }
    return 'none';
  }

  function initializeBirds() {
    birds = [];
    const topConstraint = monthHeight * 0.8;
    for (let i = 0; i < months.length; i++) {
      const totalBirds = p.int(csvData.getString(i, 'Killed')) || 0;
      const childrenKilled =
        p.int(csvData.getString(i, 'Children Killed')) || 0;
      const highlightCount = p.int(csvData.getString(i, 'Highlighted')) || 0;
      const lowerLimit = i === 0 ? topConstraint : monthHeight * i;
      const upperLimit =
        i === months.length - 1
          ? lowerLimit + monthHeight * 0.9
          : lowerLimit + monthHeight;

      const yRangeCenter = (lowerLimit + upperLimit) / 2;
      const yRangeDeviation = (upperLimit - lowerLimit) / 4;

      const xRangeCenter = p.width / 2;
      const xRangeDeviation = p.width / 4;

      const clusterCenterX = p.random(xRangeCenter, xRangeCenter);
      const clusterCenterY = p.random(yRangeCenter, yRangeCenter);
      const clusterDeviation = 120;

      let highlightAssigned = 0;

      const monthBirds = Array.from({ length: totalBirds }, (_, birdIndex) => {
        let bird;
        do {
          let yPosition, xPosition;
          if (highlightAssigned < highlightCount) {
            do {
              yPosition = p.randomGaussian(clusterCenterY, clusterDeviation);
              xPosition = p.randomGaussian(
                clusterCenterX * 1.2,
                clusterDeviation
              );
            } while (
              isInsideExclusionZoneOrBuffer(xPosition, yPosition) !== 'none' ||
              xPosition < xPadding ||
              xPosition > p.width - xPadding
            );
          } else if (totalBirds > 2000) {
            do {
              yPosition = p.randomGaussian(yRangeCenter, yRangeDeviation);
              xPosition = p.randomGaussian(xRangeCenter, xRangeDeviation);
            } while (xPosition < xPadding || xPosition > p.width - xPadding);
          } else {
            yPosition = p.random(lowerLimit, upperLimit);
            xPosition = p.random(xPadding, p.width - xPadding);
          }

          const zoneStatus = isInsideExclusionZoneOrBuffer(
            xPosition,
            yPosition
          );

          if (
            zoneStatus === 'none' ||
            (zoneStatus === 'buffer' && Math.random() < 0.3)
          ) {
            let birdColor;

            if (highlightAssigned < highlightCount) {
              birdColor = '#DCB85F';
              highlightAssigned++;
            } else {
              birdColor = birdIndex < childrenKilled ? '#7B86FF' : '#fff';
            }

            bird = {
              x: xPosition,
              y: yPosition,
              color: birdColor,
            };
          }
        } while (!bird);

        return bird;
      });

      birds.push(monthBirds);
    }
  }

  p.draw = function () {
    p.translate(-p.width / 2, -p.height / 2);

    let y = 0;

    images.forEach((img) => {
      let scaledHeight = Math.round((img.height / img.width) * p.width);

      p.image(img, 0, y, p.width, scaledHeight);

      y += scaledHeight - 20;
    });

    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      for (let bird of birds[monthIndex]) {
        p.push();
        p.translate(bird.x, bird.y);
        p.noStroke();
        BirdShapes.bird(p, 0, 0, p.random(10, 15), bird.color);
        p.pop();
      }
    }

    document.dispatchEvent(new Event('oneSketchLoaded'));
    exclusionZones.forEach((zone) => {
      p.noFill();
      p.noStroke();
      p.rect(zone.x, zone.y, zone.width, zone.height);

      const bufferSize = 50;
      p.noStroke();
      p.rect(
        zone.x - bufferSize,
        zone.y - bufferSize,
        zone.width + 2 * bufferSize,
        zone.height + 2 * bufferSize
      );
    });
  };

  p.updateData = function (newData) {
    months = newData.months || [];
    initializeBirds();
    p.redraw();
  };

  p.updateStoryData = function (data) {
    exclusionZones = data.zones;
    initializeBirds();
    p.redraw();
  };
};

window.p5Instance = new p5(oneSketch, 'one');
