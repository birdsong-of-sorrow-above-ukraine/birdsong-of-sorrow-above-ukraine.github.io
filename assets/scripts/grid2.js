fetch('./assets/translations/translation.json')
  .then((response) => response.json())
  .then((translationData) => {
    const language = 'en';
    const t = translationData[language];
    const monthHeight = 400;
    const xPadding = 20;

    const grid = document.getElementById('grid2');
    const csvPath = './assets/data/civilian_casualties.csv';

    let exclusionZones = [];

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

    async function fetchCSV() {
      const response = await fetch(csvPath);
      const csvText = await response.text();
      const rows = csvText.split('\n').map((row) => row.split(','));
      const headers = rows.shift();
      const data = rows.map((row) => {
        const rowObject = {};
        headers.forEach((header, i) => {
          rowObject[header.trim()] = row[i]?.trim() || '';
        });
        return rowObject;
      });
      return data;
    }

    async function initializeGrid() {
      const data = await fetchCSV();
      let q = 1;
      for (let i = 0; i < data.length; i += 3) {
        const groupedData = data.slice(i, i + 3);
        const groupSize = groupedData.length;
        let backgroundUrl;
        let backgroundPosition;
        const cell = document.createElement('div');
        cell.className = 'grid-cell-group';
        cell.id = 'q' + `${q}`;
        q++;
        cell.style.height = `${groupSize * monthHeight}px`;

        const sketch = (p) => {
          let localExclusionZones = [];

          function convertGlobalToLocal() {
            const rect = cell.getBoundingClientRect();
            const canvasStartY = rect.top; // The Y-position where this canvas starts

            // Filter only exclusion zones that overlap this canvas
            localExclusionZones = globalExclusionZones
              .filter(
                (zone) =>
                  zone.y + zone.height > canvasStartY && // Zone starts before this canvas ends
                  zone.y < canvasStartY + p.height // Zone ends after this canvas starts
              )
              .map((zone) => ({
                x: zone.x, // X stays the same
                y: zone.y - canvasStartY, // Shift Y to local
                width: zone.width,
                height: zone.height,
              }));

            console.log(
              `📍 Local Exclusion Zones for Canvas (Start Y = ${canvasStartY}px):`,
              localExclusionZones
            );
          }

          function isInsideExclusionZone(x, y) {
            const inside = localExclusionZones.some(
              (zone) =>
                x >= zone.x &&
                x <= zone.x + zone.width &&
                y >= zone.y &&
                y <= zone.y + zone.height
            );
            if (inside) return inside;
          }

          p.setup = function () {
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
              const canvasHeight = groupedData.length * monthHeight;

              const c = p.createCanvas(canvasWidth, canvasHeight);
              c.parent(parent);
              const getImageResolution = () => {
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

              if (i === 0) {
                backgroundUrl = `./assets/images/bg/t-${getImageResolution()}.png`;
                backgroundPosition = 'top';
              } else if (i + groupSize >= data.length) {
                backgroundUrl = `./assets/images/bg/b-0${groupSize}-${getImageResolution()}.png`;
                backgroundPosition = 'bottom';
              } else {
                const resolution = getImageResolution();
                backgroundUrl = `./assets/images/bg/m-0${
                  Math.floor(Math.random() * 3) + 1
                }-${resolution}.png`;
                backgroundPosition = 'center';
              }

              cell.style.backgroundImage = `url('${backgroundUrl}')`;
              cell.style.backgroundPosition = backgroundPosition;

              const updateBackgroundSize = () => {
                if (cell.offsetWidth > 1626) {
                  cell.style.backgroundSize = 'cover';
                } else {
                  cell.style.backgroundSize = 'cover';
                }
              };

              updateBackgroundSize();
              window.addEventListener('resize', updateBackgroundSize);

              p.noLoop();
            });
          };

          p.draw = function () {
            p.noStroke();
            p.background(0, 0, 0, 0);

            groupedData.forEach((row, idx) => {
              const month = row.Month;
              const year = row.Year;
              const totalBirds = parseInt(row.Killed, 10) || 0;
              const childrenKilled = parseInt(row['Children Killed'], 10) || 0;

              const yStart = idx * monthHeight;
              const yEnd = yStart + monthHeight * 1.2;
              const yRangeCenter = (yStart + yEnd) / 2;
              const yRangeDeviation = (yEnd - yStart) / 3;

              let monthBirds = [];
              if (month === 'March' && year === '2022') {
                const extendedYStart = yStart - monthHeight * 0.25;
                const extendedYEnd = yEnd + monthHeight * 0.25;

                const xRangeCenter = p.width / 2;
                const xRangeDeviation = p.width / 3;

                monthBirds = Array.from({ length: totalBirds }, () => {
                  let bird;
                  do {
                    const xPosition = p.randomGaussian(
                      xRangeCenter,
                      xRangeDeviation * 0.8
                    );
                    const yPosition = p.randomGaussian(
                      yRangeCenter,
                      yRangeDeviation
                    );

                    const zoneStatus = isInsideExclusionZoneOrBuffer(
                      xPosition,
                      yPosition
                    );

                    if (
                      zoneStatus === 'none' ||
                      (zoneStatus === 'buffer' && Math.random() < 0.3)
                    ) {
                      bird = {
                        x: xPosition,
                        y: yPosition,
                        color:
                          Math.random() < childrenKilled / totalBirds
                            ? '#7B86FF'
                            : '#fff',
                      };
                    }
                  } while (!bird);
                  return bird;
                });
              } else if (month === 'February' && year === '2022') {
                const restrictedYStart = yStart + monthHeight * 0.8;

                const xRangeCenter = p.width / 2;
                const xRangeDeviation = p.width / 4;
                const yRangeCenter = (restrictedYStart + yEnd) / 1.5;
                const yRangeDeviation = (yEnd - restrictedYStart) / 2;

                monthBirds = Array.from({ length: totalBirds }, () => {
                  let bird;
                  do {
                    const xPosition = p.randomGaussian(
                      xRangeCenter,
                      xRangeDeviation
                    );
                    const yPosition = Math.max(
                      p.randomGaussian(yRangeCenter, yRangeDeviation),
                      restrictedYStart
                    );

                    const zoneStatus = isInsideExclusionZoneOrBuffer(
                      xPosition,
                      yPosition
                    );

                    if (
                      zoneStatus === 'none' ||
                      (zoneStatus === 'buffer' && Math.random() < 0.3)
                    ) {
                      bird = {
                        x: xPosition,
                        y: yPosition,
                        color:
                          Math.random() < childrenKilled / totalBirds
                            ? '#7B86FF'
                            : '#fff',
                      };
                    }
                  } while (!bird);
                  return bird;
                });
              } else {
                monthBirds = Array.from(
                  { length: totalBirds },
                  (_, birdIndex) => {
                    let bird;
                    do {
                      const xPosition = p.random(xPadding, p.width - xPadding);
                      const yPosition = p.random(yStart, yEnd);

                      const zoneStatus = isInsideExclusionZoneOrBuffer(
                        xPosition,
                        yPosition
                      );

                      if (
                        zoneStatus === 'none' ||
                        (zoneStatus === 'buffer' && Math.random() < 0.3)
                      ) {
                        bird = {
                          x: xPosition,
                          y: yPosition,
                          color:
                            birdIndex < childrenKilled ? '#7B86FF' : '#fff',
                        };
                      }
                    } while (!bird);
                    return bird;
                  }
                );
              }

              monthBirds.forEach((bird) => {
                p.push();
                p.translate(bird.x, bird.y);
                p.noStroke();
                BirdShapes.bird(p, 0, 0, p.random(10, 15), bird.color);
                p.pop();
              });
            });
          };

          function updateStoryData(data) {
            exclusionZones = data.zones; // Save the zones
          }

          p.updateStoryData = function (data) {
            console.log('updateStoryData called with:', data);
            exclusionZones = data.zones;
            console.log('Updated exclusion zones:', exclusionZones);
            initializeGrid();
            p.redraw();
          };
        };

        window.p5Instance = new p5(sketch, 'grid2');

        grid.appendChild(cell);
      }
    }

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
  });
