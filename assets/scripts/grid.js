const grid = document.getElementById('grid');
const csvPath = './assets/data/civilian_casualties.csv';
const images = []; // Array to hold images

// Preload images
for (let i = 1; i <= 28; i++) {
  const filename = i.toString().padStart(2, '0') + '.png'; // Generate '01.png', '02.png', etc.
  images.push(`./assets/images/squares/${filename}`); // Update the path as per your folder structure
}

// Function to fetch and parse CSV
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

// Initialize the grid with data
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

// Monitor the grid's display property
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
