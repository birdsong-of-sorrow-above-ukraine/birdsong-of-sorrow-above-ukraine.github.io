const MONTH_HEIGHT = 400;
const xPadding = 20;

const csvPath = './assets/data/civilian_casualties.csv';

const grid = document.getElementById('grid');
const allAtOnce = document.getElementById('allAtOnce');

const images = []; // Array to hold images

// Preload images
for (let j = 1; j <= 28; j++) {
  const filename = j.toString().padStart(2, '0') + '.png';
  images.push(`./assets/images/squares/${filename}`);
}

async function fetchCSV() {
  const response = await fetch(csvPath);
  const csvText = await response.text();

  // Parse CSV manually or use a library
  const rows = csvText.split('\n').map((row) => row.split(','));
  const headers = rows.shift(); // Extract headers
  const data = rows.map((row) => {
    const rowObject = {};
    headers.forEach((header, i) => {
      rowObject[header.trim()] = row[i].trim();
    });
    return rowObject;
  });

  return data;
}

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

function isInsideExclusionZoneOrBuffer(x, y, quarterExclusionZones) {
  let zoneStatus = 'none';
  if (!quarterExclusionZones) {
    return zoneStatus;
  }
  if (quarterExclusionZones.find((zone) => isInsideRect(x, y, zone))) {
    zoneStatus = 'exclusion';
  } else if (
    quarterExclusionZones.find((zone) => isInsideBufferZone(x, y, zone, 30))
  ) {
    zoneStatus = 'buffer';
  }
  return zoneStatus;
}

const getImageResolution = (cell) => {
  const canvasW = cell.clientWidth;
  console.log(canvasW);
  if (canvasW < 720) {
    return 300;
  } else if (canvasW < 1024) {
    return 720;
  } else if (canvasW < 1600) {
    return 1024;
  } else {
    return 1600;
  }
};

function getNotesParameters() {
  const stories = document.querySelectorAll('.story');
  const notesParameters = [];

  stories.forEach((story) => {
    const computedStyle = window.getComputedStyle(story);
    const transform = computedStyle.transform;
    let originalX = story.offsetLeft;
    let originalY = story.offsetTop;

    if (transform && transform.includes('matrix')) {
      originalX = story.offsetLeft - story.offsetWidth / 2;
      originalY = story.offsetTop - story.offsetHeight / 2;
    }

    const quarterHeight = MONTH_HEIGHT * 3;
    const quarter = Math.floor(originalY / quarterHeight) + 1;
    const adjustedY = originalY - (quarter - 1) * quarterHeight;

    notesParameters.push({
      x: originalX,
      y: adjustedY,
      width: story.offsetWidth,
      height: story.offsetHeight,
      q: quarter,
    });
  });

  return notesParameters;
}

function setupBackground(cell, i, maxLength, qSize) {
  const imageResolution = getImageResolution(cell);
  let backgroundUrl;
  let backgroundPosition;
  if (i === 0) {
    backgroundUrl = `./assets/images/bg/t-${imageResolution}.png`;
    backgroundPosition = 'top';
  } else if (i + qSize >= maxLength) {
    backgroundUrl = `./assets/images/bg/b-0${qSize}-${imageResolution}.png`;
    backgroundPosition = 'bottom';
  } else {
    backgroundUrl = `./assets/images/bg/m-0${
      Math.floor(Math.random() * 3) + 1
    }-${imageResolution}.png`;
    backgroundPosition = 'center';
  }

  cell.style.backgroundImage = `url('${backgroundUrl}')`;
  cell.style.backgroundSize = 'cover';
  cell.style.backgroundPosition = backgroundPosition;
}

function setupP5(p, cell, dataGroupedByQ, i, maxLength, qSize) {
  const parent = cell;

  const waitForWidth = () =>
    new Promise((resolve) => {
      const interval = setInterval(() => {
        if (parent.clientWidth > 0) {
          clearInterval(interval);
          resolve(parent.clientWidth);
        }
      }, 50);
    });

  waitForWidth().then((canvasWidth) => {
    const canvasHeight = dataGroupedByQ.length * MONTH_HEIGHT;
    setupBackground(cell, i, maxLength, qSize);
    const c = p.createCanvas(canvasWidth, canvasHeight);
    c.parent(parent);

    p.noLoop();
    document.dispatchEvent(new Event('allAtOnceSketchLoaded'));
  });
}

function commonlyDrawBirds(p, dataGroupedByQ, monthNum) {
  p.noStroke();
  p.background(0, 0, 0, 0);
  dataGroupedByQ.forEach((row, idx) => {
    const {
      Month: month,
      Year: year,
      Killed,
      Highlighted,
      'Children Killed': childrenKilledStr,
    } = row;
    const totalBirds = parseInt(Killed, 10) || 0;
    const childrenKilled = parseInt(childrenKilledStr, 10) || 0;
    const highlighted = parseInt(Highlighted, 10) || 0;

    const yRange = computeYRange(idx);
    const birds = distributeBirds(
      p,
      month,
      year,
      totalBirds,
      childrenKilled,
      highlighted,
      yRange,
      monthNum
    );

    birds.forEach((bird) => {
      p.push();
      p.translate(bird.x, bird.y);
      p.noStroke();
      BirdShapes.bird(p, 0, 0, p.random(10, 15), bird.color);
      p.pop();
    });
  });
}

function computeYRange(idx) {
  const yStart = idx * MONTH_HEIGHT;
  const yEnd = yStart + MONTH_HEIGHT * 1.2;
  return {
    yStart,
    yEnd,
    yRangeCenter: (yStart + yEnd) / 2,
    yRangeDeviation: (yEnd - yStart) / 4,
  };
}

function generateBird(
  p,
  xCenter,
  xDeviation,
  yCenter,
  yDeviation,
  childrenKilledRatio,
  quarterExclusionZones,
  color = null
) {
  let bird;
  do {
    const x = p.randomGaussian(xCenter, xDeviation);
    const y = p.randomGaussian(yCenter, yDeviation);
    const zoneStatus = isInsideExclusionZoneOrBuffer(
      x,
      y,
      quarterExclusionZones
    );

    if (
      zoneStatus === 'none' ||
      (zoneStatus === 'buffer' && Math.random() < 0.3)
    ) {
      bird = {
        x,
        y,
        color:
          color || (Math.random() < childrenKilledRatio ? '#7B86FF' : '#fff'),
      };
    }
  } while (!bird);
  return bird;
}

function distributeBirds(
  p,
  month,
  year,
  totalBirds,
  childrenKilled,
  highlighted,
  yRange,
  monthNum
) {
  let birds = [];
  let exclusionZones = getNotesParameters();
  let quarterExclusionZones = exclusionZones.filter(
    (zone) => zone.q === Math.floor(monthNum / 3 + 1)
  );

  const childrenKilledRatio = childrenKilled / totalBirds;
  const highlightRatio = highlighted / totalBirds;

  let highlightXCenter = p.width / 2;
  let highlightedGroup = Array.from({ length: highlighted }, () =>
    generateBird(
      p,
      highlightXCenter,
      p.width * 0.08,
      yRange.yRangeCenter,
      yRange.yRangeDeviation,
      0,
      quarterExclusionZones,
      '#DCB85F'
    )
  );

  if (month === 'March' && year === '2022') {
    birds = Array.from({ length: totalBirds - highlighted }, () =>
      generateBird(
        p,
        p.width / 2,
        (p.width / 3) * 0.8,
        yRange.yRangeCenter,
        yRange.yRangeDeviation,
        childrenKilledRatio,
        quarterExclusionZones
      )
    );
  } else if (month === 'February' && year === '2022') {
    const restrictedYStart = yRange.yStart + MONTH_HEIGHT * 0.8;
    birds = Array.from({ length: totalBirds - highlighted }, () =>
      generateBird(
        p,
        p.width / 2,
        p.width / 4,
        (restrictedYStart + yRange.yEnd) / 1.5,
        (yRange.yEnd - restrictedYStart) / 3,
        childrenKilledRatio,
        quarterExclusionZones
      )
    );
  } else {
    birds = Array.from({ length: totalBirds - highlighted }, (_, i) => {
      let bird;
      do {
        const x = p.random(xPadding, p.width - xPadding);
        const y = p.random(yRange.yStart, yRange.yEnd);
        const zoneStatus = isInsideExclusionZoneOrBuffer(
          x,
          y,
          quarterExclusionZones
        );
        if (
          zoneStatus === 'none' ||
          (zoneStatus === 'buffer' && Math.random() < 0.3)
        ) {
          let color = Math.random() < childrenKilledRatio ? '#7B86FF' : '#fff';
          bird = { x, y, color };
        }
      } while (!bird);
      return bird;
    });
  }

  return [...highlightedGroup, ...birds];
}

async function initializeAllAtOnce() {
  const data = await fetchCSV();
  let id = 1;
  for (let i = 0; i < data.length; i += 3) {
    const dataGroupedByQ = data.slice(i, i + 3);
    const qSize = dataGroupedByQ.length;
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.id = 'q' + `${id}`;
    id++;
    cell.style.height = `${qSize * MONTH_HEIGHT}px`;

    const sketch = (p) => {
      p.setup = () => setupP5(p, cell, dataGroupedByQ, i, data.length, qSize);

      p.draw = () => commonlyDrawBirds(p, dataGroupedByQ, i);
    };

    window.p5Instance = new p5(sketch, 'allAtOnce');
    allAtOnce.appendChild(cell);
  }
}

async function initializeGrid() {
  // Clear any existing grid content
  grid.innerHTML = '';

  const data = await fetchCSV();

  data.forEach((row, index) => {
    const month = row.Month; // Month name
    const year = row.Year; // Year
    const totalBirds = parseInt(row.Killed, 10) || 0; // Total lives lost in the month
    const childrenKilled = parseInt(row['Children Killed'], 10) || 0; // Children lives lost in the month
    const cumulativeBirds = parseInt(row['Cum Killed'], 10) || 0; // Cumulative lives lost
    const cumulativeChildren = parseInt(row['Cum Children Killed'], 10) || 0; // Cumulative children lost

    const imageIndex = new Date(`${month} 1, 2000`).getMonth(); // Converts month name to index (0-based)
    const imagePath = images[imageIndex];

    // Create a grid cell
    const cell = document.createElement('div');
    cell.className = 'grid-cell';

    // Add a label below the canvas
    const label = document.createElement('div');
    label.className = 'grid-label';

    // Create the first row for the current month
    const topRow = document.createElement('div');
    topRow.className = 'grid-label-top';

    const monthSpan = document.createElement('span');
    monthSpan.className = 'grid-label-month';
    monthSpan.textContent = month;

    // Append year for the first month and all Januaries
    if (month === 'January' || index === 0) {
      const yearSpan = document.createElement('span');
      yearSpan.className = 'grid-label-year';
      yearSpan.textContent = ` (${year})`;
      monthSpan.appendChild(yearSpan);
    }

    const livesLostSpan = document.createElement('span');
    livesLostSpan.className = 'grid-label-lives-lost';
    livesLostSpan.textContent = `${totalBirds} lives lost, incl. ${childrenKilled} children`;

    // Append spans to the first row
    topRow.appendChild(monthSpan);
    topRow.appendChild(document.createTextNode(' ')); // Add a space
    topRow.appendChild(livesLostSpan);

    // Create the second row for the cumulative total by this month
    const bottomRow = document.createElement('div');
    bottomRow.className = 'grid-label-bottom';

    const totalByThisMonthSpan = document.createElement('span');
    totalByThisMonthSpan.className = 'grid-label-total';
    totalByThisMonthSpan.textContent = `Total by this month`;

    const cumulativeLivesSpan = document.createElement('span');
    cumulativeLivesSpan.className = 'grid-label-cumulative-lives';
    cumulativeLivesSpan.textContent = `${cumulativeBirds} lives (${cumulativeChildren} children)`;

    // Append spans to the second row
    bottomRow.appendChild(totalByThisMonthSpan);
    bottomRow.appendChild(document.createTextNode(' ')); // Add a space
    bottomRow.appendChild(cumulativeLivesSpan);

    // Append both rows to the label
    label.appendChild(topRow);
    label.appendChild(bottomRow);

    cell.appendChild(label);

    // Add the cell to the grid
    grid.appendChild(cell);

    // Attach p5.js to this cell
    const sketch = (p) => {
      let parentWidth, parentHeight;

      let bgImage;

      p.preload = function () {
        bgImage = p.loadImage(imagePath); // Load the background image
      };

      p.setup = function () {
        const parent = cell; // Use the grid cell as the parent container

        const resizeCanvasToParent = () => {
          parentWidth = parent.offsetWidth || 350; // Fallback width
          parentHeight = parent.offsetWidth || 350; // Fallback height

          if (parentWidth > 0 && parentHeight > 0) {
            p.resizeCanvas(parentWidth, parentHeight);
          } else {
            setTimeout(resizeCanvasToParent, 50); // Retry if parent size is 0
          }
        };

        // Create canvas and call resize function
        const c = p.createCanvas(1, 1); // Temporary size, will resize immediately
        c.parent(cell);
        resizeCanvasToParent();
        p.noLoop();
      };

      p.draw = function () {
        p.noStroke();
        p.image(bgImage, 0, 0, p.width, p.height);

        // Define the width range for dots based on the specific condition
        let xStart = 15;
        let xEnd = p.width - 15;

        // Special condition for February 2022
        if (month === 'February' && year === '2022') {
          xStart = p.width * 0.8; // Start at 80% of canvas width
          xEnd = p.width - 15; // End at 100% of canvas width
        }

        // Draw children losses as light blue birds
        for (let i = 0; i < childrenKilled; i++) {
          const x = p.random(xStart, xEnd); // Adjusted x-range
          const y = p.random(25, p.height - 25);
          p.fill('#7B86FF'); // Light blue for children
          BirdShapes.bird(p, x, y, p.random(10, 12), '#7B86FF');
        }

        // Draw remaining losses as standard blue birds
        for (let i = childrenKilled; i < totalBirds; i++) {
          const x = p.random(xStart, xEnd); // Adjusted x-range
          const y = p.random(25, p.height - 25);
          BirdShapes.bird(p, x, y, p.random(10, 12), '#fff');
        }
      };

      let lastWidth = 0;
      let lastHeight = 0;

      p.windowResized = function () {
        const parent = cell;
        const parentWidth = parent.offsetWidth;
        const parentHeight = parent.offsetWidth;

        // Only resize if the dimensions change significantly
        if (
          Math.abs(parentWidth - lastWidth) > 100 ||
          Math.abs(parentHeight - lastHeight) > 100
        ) {
          lastWidth = parentWidth;
          lastHeight = parentHeight;
          p.resizeCanvas(parentWidth, parentHeight);
          p.redraw();
        }
      };
    };

    new p5(sketch);
  });
}

function drawMyBirds2() {
  const observer = new MutationObserver(() => {
    if (window.getComputedStyle(allAtOnce).display !== 'none') {
      console.log('Grid is now displayed. Initializing sketches...');
      initializeAllAtOnce();
    }
  });

  observer.observe(allAtOnce, { attributes: true, attributeFilter: ['style'] });

  if (window.getComputedStyle(allAtOnce).display !== 'none') {
    initializeAllAtOnce();
  }
}
function drawMyBirds() {
  const observer = new MutationObserver(() => {
    if (window.getComputedStyle(grid).display !== 'none') {
      console.log('Grid is now displayed. Initializing sketches...');
      initializeGrid(); // Call grid initialization
    }
  });

  observer.observe(grid, { attributes: true, attributeFilter: ['style'] });

  // Initialize grid if it is already visible
  if (window.getComputedStyle(grid).display !== 'none') {
    initializeGrid();
  }
}
drawMyBirds();
