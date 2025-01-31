fetch('./assets/translations/translation.json')
  .then((response) => response.json())
  .then((translationData) => {
    const language = 'en'; // Adjust this based on your language setting
    const notesData = translationData[language]?.notes || []; // Safely access notes
    const monthsData = translationData[language]?.months || []; // Safely access months
    const container = document.getElementById('stories');
    if (!container) {
      console.error('Container not found!');
      return;
    }

    const monthHeight = 400; // The height of each month section
    const monthTopPadding = 24; // The top padding before the first month

    // Create a mapping from month names to their positions
    const monthPositions = {};
    monthsData.forEach((month, index) => {
      const monthKey = month.year
        ? `${month.label} ${month.year}`
        : `${month.label}`;
      const monthTop = monthTopPadding + index * monthHeight; // Top position of the month
      const monthMiddle = monthTop + monthHeight / 2; // Middle position of the month
      const monthMiddleBottom = monthTop + monthHeight / 1.5;
      const monthBottom = monthTop + monthHeight; // Bottom position of the month
      monthPositions[monthKey] = {
        index,
        top: monthTop,
        middle: monthMiddle,
        middleBottom: monthMiddleBottom,
        bottom: monthBottom,
      };

      // Create month label elements
      const monthElement = document.createElement('div');
      monthElement.className = 'month-label'; // Base class for month labels
      monthElement.innerHTML = monthKey;

      monthElement.style.position = 'absolute';
      monthElement.style.left = '2rem'; // Adjust this as needed
      monthElement.style.top = `${monthTop}px`; // Adjust for spacing

      // Append month label to the container
      container.appendChild(monthElement);
    });

    // Process notes
    notesData.forEach((noteData) => {
      // Determine the y position based on the month and yPlacement
      let yPosition;

      if (noteData.month) {
        const monthKey = noteData.year
          ? `${noteData.month} ${noteData.year}`
          : `${noteData.month}`;
        const monthPosition = monthPositions[monthKey];
        if (monthPosition) {
          // Determine yPosition based on yPlacement
          switch (noteData.yPlacement) {
            case 'top':
              yPosition = monthPosition.top + 120;
              break;
            case 'bottom':
              yPosition = monthPosition.bottom;
              break;
            case 'middleBottom':
              yPosition = monthPosition.middleBottom;
              break;
            case 'middle':
            default:
              yPosition = monthPosition.middle;
              break;
          }
        } else {
          console.warn(`Month '${monthKey}' not found in months data.`);
          yPosition = 0; // Default position if month not found
        }
      } else {
        yPosition = 0; // Default position if month not specified
      }

      // Determine the x position based on xPlacement
      let xPosition;
      const containerWidth = container.offsetWidth; // Get the width of the container
      if (noteData.xPlacement) {
        switch (noteData.xPlacement) {
          case 'left':
            xPosition = containerWidth * 0.1; // Adjust as needed
            break;
          case 'right':
            xPosition = containerWidth * 0.7; // Adjust as needed
            break;
          case 'center':
          default:
            xPosition = containerWidth / 2;
            break;
        }
      } else {
        xPosition = 0; // Default position if xPlacement not specified
      }

      // Create a container for each story
      const storyElement = document.createElement('div');
      storyElement.className = 'story'; // Base class for the story container
      storyElement.style.position = 'absolute';
      storyElement.style.left = `${xPosition}px`;
      storyElement.style.top = `${yPosition}px`;
      storyElement.style.transform = noteData.centered
        ? 'translate(-50%, -50%)'
        : 'none';
      storyElement.style.textAlign = noteData.centered ? 'center' : 'left';

      // If the note exists, create the note element
      if (noteData.note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = noteData.note;
        storyElement.appendChild(noteElement);
      }

      // If the subnote exists, create the subnote element
      if (noteData.subnote) {
        const subnoteElement = document.createElement('div');
        subnoteElement.className = 'subnote';
        subnoteElement.style.maxWidth = noteData.centered ? '22rem' : '22rem';
        subnoteElement.innerHTML = noteData.subnote;

        // Add the source link if it exists
        if (noteData.sourceText && noteData.sourceLink) {
          const spaceTextNode = document.createTextNode(' '); // Create a space outside the <a>
          const sourceElement = document.createElement('a');
          sourceElement.href = noteData.sourceLink;
          sourceElement.target = '_blank';
          sourceElement.rel = 'noopener noreferrer';
          sourceElement.innerText = noteData.sourceText;

          subnoteElement.appendChild(spaceTextNode); // Append space first
          subnoteElement.appendChild(sourceElement); // Append the <a> element
        }

        storyElement.appendChild(subnoteElement);
      }

      // Append the story container to the main container
      container.appendChild(storyElement);
    });

    // After all stories have been appended, create the array of their positions and sizes
    const storyElementsData = getStoryElementsData();
    // You can now use storyElementsData as needed

    window.p5Instance.updateStoryData({
      zones: storyElementsData,
    });
  })
  .catch((error) => {
    console.error('Error loading translation data:', error);
  });

// Function to create an array with x, y, width, and height of all divs with class 'story'
function getStoryElementsData() {
  const stories = document.querySelectorAll('.story');
  const storyDataArray = [];

  stories.forEach((story) => {
    const rect = story.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(story);

    // Check if `transform: translate(-50%, -50%)` is applied
    const transform = computedStyle.transform;

    let adjustedX = story.offsetLeft;
    let adjustedY = story.offsetTop;

    if (transform && transform.includes('matrix')) {
      // Adjust for `translate(-50%, -50%)`
      adjustedX = story.offsetLeft - story.offsetWidth / 2;
      adjustedY = story.offsetTop - story.offsetHeight / 2;
    }

    storyDataArray.push({
      x: adjustedX,
      y: adjustedY,
      width: story.offsetWidth,
      height: story.offsetHeight,
    });
  });

  return storyDataArray;
}
