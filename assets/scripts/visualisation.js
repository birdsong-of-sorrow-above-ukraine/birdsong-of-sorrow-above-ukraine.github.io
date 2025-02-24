const MONTH_HEIGHT = 400;
const yPadding = 40;

const csvPath = './assets/data/civilian_casualties.csv';

const grid = document.getElementById('grid');
const allAtOnce = document.getElementById('allAtOnceCanvas');

const images = [];

const isMobile = window.innerWidth <= 768;
const xPadding = isMobile ? 12 : 20;

const highlightedData = [
  { month: 'April', year: '2022', highlighted: 52, position: 'left' },
  { month: 'July', year: '2022', highlighted: 23, position: 'right' },
  { month: 'October', year: '2022', highlighted: 11, position: 'left' },
  { month: 'January', year: '2023', highlighted: 46, position: 'right' },
  { month: 'April', year: '2023', highlighted: 23, position: 'right' },
  { month: 'June', year: '2023', highlighted: 13, position: 'left' },
  { month: 'October', year: '2023', highlighted: 59, position: 'right' },
  { month: 'December', year: '2023', highlighted: 30, position: 'left' },
  { month: 'March', year: '2024', highlighted: 5, position: 'left' },
  { month: 'July', year: '2024', highlighted: 2, position: 'left' },
  { month: 'September', year: '2024', highlighted: 12, position: 'right' },
];

for (let j = 1; j <= 28; j++) {
  const filename = j.toString().padStart(2, '0') + '.png';
  images.push(`./assets/images/squares/${filename}`);
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
    quarterExclusionZones.find((zone) => isInsideBufferZone(x, y, zone, 20))
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
  const elements = document.querySelectorAll('.story, .stat, .month');
  const notesParameters = [];

  elements.forEach((element) => {
    const computedStyle = window.getComputedStyle(element);
    const transform = computedStyle.transform;

    let originalX = element.offsetLeft;
    let originalY = element.offsetTop;

    if (transform && transform.includes('matrix')) {
      originalX = element.offsetLeft - element.offsetWidth / 2;
      originalY = element.offsetTop - element.offsetHeight / 2;
    }

    if (originalY <= 800) return;

    const quarterHeight = MONTH_HEIGHT * 3;
    const quarter = Math.floor(originalY / quarterHeight) + 1;
    const adjustedY = originalY - (quarter - 1) * quarterHeight;

    notesParameters.push({
      x: originalX,
      y: adjustedY,
      width: element.offsetWidth,
      height: element.offsetHeight,
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
      'Children Killed': childrenKilledStr,
    } = row;
    const totalBirds = parseInt(Killed, 10) || 0;
    const childrenKilled = parseInt(childrenKilledStr, 10) || 0;

    const yRange = computeYRange(idx);
    const birds = distributeBirds(
      p,
      month,
      year,
      totalBirds,
      childrenKilled,
      yRange,
      monthNum
    );

    birds.forEach((bird) => {
      p.push();
      p.translate(bird.x, bird.y);
      p.noStroke();
      const birdSize = isMobile ? p.random(5, 7) : p.random(10, 15);
      BirdShapes.bird(p, 0, 0, birdSize, bird.color);
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
  yRange,
  monthNum
) {
  let birds = [];
  let exclusionZones = getNotesParameters();

  console.log(exclusionZones);
  let quarterExclusionZones = exclusionZones.filter(
    (zone) => zone.q === Math.floor(monthNum / 3 + 1)
  );

  const childrenKilledRatio = childrenKilled / totalBirds;

  const highlightedEntry = highlightedData.find(
    (entry) => entry.month === month && entry.year === year
  );
  const highlighted = highlightedEntry ? highlightedEntry.highlighted : 0;
  const position = highlightedEntry ? highlightedEntry.position : 'center';

  let highlightXCenter;
  if (position === 'left') {
    highlightXCenter = p.width * 0.25;
  } else if (position === 'right') {
    highlightXCenter = p.width * 0.75;
  } else {
    highlightXCenter = p.width / 2;
  }

  let highlightedGroup = Array.from({ length: highlighted }, () =>
    generateBird(
      p,
      highlightXCenter,
      p.width / 6,
      yRange.yRangeCenter,
      yRange.yRangeDeviation * 0.8,
      0,
      quarterExclusionZones,
      '#DCB85F'
    )
  );

  const generateConstrainedBird = (xDeviation, yCenter, yDeviation) => {
    let bird;
    do {
      bird = generateBird(
        p,
        p.random(xPadding, p.width - xPadding),
        xDeviation,
        yCenter,
        yDeviation,
        childrenKilledRatio,
        quarterExclusionZones
      );
      bird.y = Math.max(p.random(MONTH_HEIGHT * 0.8, MONTH_HEIGHT), bird.y);
    } while (bird.x < xPadding || bird.x > p.width - xPadding);

    return bird;
  };

  if (year === '2022' && (month === 'March' || month === 'February')) {
    birds = Array.from({ length: totalBirds - highlighted }, () =>
      generateConstrainedBird(
        month === 'March' ? p.width / 4 : p.width / 4,
        month === 'March'
          ? yRange.yRangeCenter * 0.97
          : (MONTH_HEIGHT * 0.8 + yRange.yEnd) / 2,
        month === 'March'
          ? yRange.yRangeDeviation * 1.2
          : (yRange.yEnd - MONTH_HEIGHT * 0.8) / 4
      )
    );
  } else {
    birds = Array.from({ length: totalBirds - highlighted }, () => {
      let bird;
      do {
        const x = p.random(xPadding, p.width - xPadding);
        const y =
          year === '2024' && month === 'October'
            ? p.random(yRange.yStart, p.height - yPadding)
            : p.random(yRange.yStart, yRange.yEnd);
        const zoneStatus = isInsideExclusionZoneOrBuffer(
          x,
          y,
          quarterExclusionZones
        );
        if (
          zoneStatus === 'none' ||
          (zoneStatus === 'buffer' && Math.random() < 0.4)
        ) {
          bird = {
            x,
            y,
            color: Math.random() < childrenKilledRatio ? '#7B86FF' : '#fff',
          };
        }
      } while (!bird);
      return bird;
    });
  }

  return [...highlightedGroup, ...birds];
}

async function initializeAllAtOnce() {
  allAtOnce.innerHTML = '';
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

    window.p5Instance = new p5(sketch, 'allAtOnceCanvas');
    allAtOnce.appendChild(cell);
  }
}

async function initializeGrid() {
  grid.innerHTML = '';
  const data = await fetchCSV();

  data.forEach((row, index) => {
    const month = row.Month;
    const year = row.Year;
    const totalBirds = parseInt(row.Killed, 10) || 0;
    const childrenKilled = parseInt(row['Children Killed'], 10) || 0;

    const imageIndex = new Date(`${month} 1, 2000`).getMonth();
    const imagePath = images[imageIndex];

    const cell = document.createElement('div');
    cell.className = 'grid-cell';

    const label = document.createElement('div');
    label.className = 'grid-label';

    const monthSpan = document.createElement('span');
    monthSpan.className = 'grid-label-month';
    monthSpan.textContent = currentLanguageData.months[index].label;
    const livesLostSpan = document.createElement('span');
    livesLostSpan.className = 'grid-label-lives-lost';
    livesLostSpan.innerHTML = `${totalBirds} <span id='text-lives-lost-min'>${currentLanguageData.livesLostMin}</span> (${childrenKilled}<span id='text-children'> ${currentLanguageData.children}</span>)`;
    label.appendChild(monthSpan);
    label.appendChild(document.createTextNode(' '));
    label.appendChild(livesLostSpan);
    cell.appendChild(label);
    grid.appendChild(cell);

    if (month === 'January' || index === 0) {
      const yearSpan = document.createElement('span');
      yearSpan.className = 'grid-label-year';
      yearSpan.textContent = ` (${year})`;
      monthSpan.appendChild(yearSpan);
    }

    if (index === 0) {
      livesLostSpan.innerHTML = `${totalBirds} <span id='text-lives-lost'>${currentLanguageData.livesLost}</span> ${childrenKilled} <span id='text-children'>${currentLanguageData.children}</span>)`;
    } else null;

    const sketch = (p) => {
      let parentWidth, parentHeight;

      let bgImage;

      p.preload = function () {
        bgImage = p.loadImage(imagePath);
      };

      p.setup = function () {
        const parent = cell;

        const resizeCanvasToParent = () => {
          parentWidth = parent.offsetWidth || 350;
          parentHeight = parent.offsetWidth || 350;

          if (parentWidth > 0 && parentHeight > 0) {
            p.resizeCanvas(parentWidth, parentHeight);
          } else {
            setTimeout(resizeCanvasToParent, 50);
          }
        };

        const c = p.createCanvas(1, 1);
        c.parent(cell);
        resizeCanvasToParent();
        p.noLoop();
      };

      p.draw = function () {
        p.noStroke();
        p.image(bgImage, 0, 0, p.width, p.height);

        let xStart = 15;
        let xEnd = p.width - 15;

        if (month === 'February' && year === '2022') {
          xStart = p.width * 0.8;
          xEnd = p.width - 15;
        }

        for (let i = 0; i < childrenKilled; i++) {
          const x = p.random(xStart, xEnd);
          const y = p.random(25, p.height - 25);
          p.fill('#7B86FF');
          BirdShapes.bird(p, x, y, p.random(10, 12), '#7B86FF');
        }

        for (let i = childrenKilled; i < totalBirds; i++) {
          const x = p.random(xStart, xEnd);
          const y = p.random(25, p.height - 25);
          BirdShapes.bird(p, x, y, p.random(10, 12), '#fff');
        }
      };

      let lastWidth = 0;
      let lastHeight = 0;

      p.updateData = function () {
        console.log('redrawn');
        p.redraw();
      };

      p.windowResized = function () {
        const parent = cell;
        const parentWidth = parent.offsetWidth;
        const parentHeight = parent.offsetWidth;

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

function drawAllAtOnce() {
  let initialized = false;
  function initializeIfNeeded() {
    if (!initialized && window.getComputedStyle(allAtOnce).display !== 'none') {
      initializeAllAtOnce();
      initialized = true;
    }
  }

  const observer = new MutationObserver(() => {
    initializeIfNeeded();
  });

  observer.observe(allAtOnce, { attributes: true, attributeFilter: ['style'] });

  initializeIfNeeded();
}

function drawGrid() {
  const observer = new MutationObserver(() => {
    if (window.getComputedStyle(grid).display !== 'none') {
      console.log('Grid is now displayed. Initializing sketches...');
      initializeGrid();
    }
  });

  observer.observe(grid, { attributes: true, attributeFilter: ['style'] });

  if (window.getComputedStyle(grid).display !== 'none') {
    initializeGrid();
  }
}
drawGrid();
