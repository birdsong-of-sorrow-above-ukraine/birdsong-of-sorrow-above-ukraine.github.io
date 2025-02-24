let previousLanguage = null;

function loadLanguage(lang) {
  fetch('./assets/translations/translation.json')
    .then((response) => response.json())
    .then((data) => {
      currentLanguageData = data[lang];
      applyTranslations(currentLanguageData);
      updateLabelsScript(currentLanguageData);
    });
}

function updateLabelsScript(currentLanguageData, lang) {
  const container = document.getElementById('stories');
  container.innerHTML = '';

  const MONTH_HEIGHT = 400;
  const TOP_PADDING = 24;
  const monthPositions = {};

  const isMobile = window.innerWidth <= 768;

  currentLanguageData.months.forEach((month, index) => {
    const monthKey = month.year ? `${month.label} ${month.year}` : month.label;
    const monthTop = TOP_PADDING + index * MONTH_HEIGHT;
    const monthMiddle = monthTop + MONTH_HEIGHT / 2;
    const monthMiddleBottom = monthTop + MONTH_HEIGHT / 1.5;
    const monthBottom = monthTop + MONTH_HEIGHT;

    monthPositions[monthKey] = {
      top: monthTop,
      middle: monthMiddle,
      middleBottom: monthMiddleBottom,
      bottom: monthBottom,
    };

    const monthElement = document.createElement('div');
    monthElement.className = 'month';
    monthElement.innerHTML = monthKey;
    monthElement.style.top = `${monthTop}px`;
    container.appendChild(monthElement);
  });

  currentLanguageData.stat.forEach((stat) => {
    const statElement = document.createElement('div');
    statElement.className = 'stat subnote';
    statElement.innerHTML = stat.subnote;

    statElement.style.position = 'absolute';
    statElement.style.transform = 'translate(-50%, -50%)';

    let xPosition = container.offsetWidth / 2;
    let yPosition = container.offsetHeight / 2;

    if (stat.month) {
      const monthKey = stat.year ? `${stat.month} ${stat.year}` : stat.month;
      if (monthPositions.hasOwnProperty(monthKey)) {
        yPosition = monthPositions[monthKey].middle;
      } else {
        console.warn(`Month '${monthKey}' not found in months data.`);
      }
    }

    if (stat.sourceText && stat.sourceLink) {
      const sourceElement = document.createElement('a');
      sourceElement.href = stat.sourceLink;
      sourceElement.target = '_blank';
      sourceElement.rel = 'noopener noreferrer';
      sourceElement.innerText = ` (${stat.sourceText})`;
      statElement.appendChild(document.createTextNode(' '));
      statElement.appendChild(sourceElement);
    }

    statElement.style.left = `${xPosition}px`;
    statElement.style.top = `${yPosition}px`;
    container.appendChild(statElement);
  });

  currentLanguageData.stories.forEach((text) => {
    let yPosition = 0;
    if (text.month) {
      const monthKey = text.year ? `${text.month} ${text.year}` : text.month;
      const monthPosition = monthPositions[monthKey];

      if (monthPosition) {
        switch (text.yPlacement) {
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
            isMobile
              ? (yPosition = monthPosition.middle)
              : (yPosition = monthPosition.top + 120);
            break;
          default:
            yPosition = monthPosition.middle;
            break;
        }
      } else {
        console.warn(`Month '${monthKey}' not found in months data.`);
      }
    }

    let xPosition = container.offsetWidth / 2;
    if (!isMobile && text.xPlacement) {
      switch (text.xPlacement) {
        case 'left':
          xPosition = container.offsetWidth * 0.1;
          break;
        case 'right':
          xPosition = container.offsetWidth * 0.7;
          break;
        case 'center':
        default:
          xPosition = container.offsetWidth / 2;
          break;
      }
    }

    const storyElement = document.createElement('div');
    storyElement.className = 'story';
    storyElement.style.left = `${xPosition}px`;
    storyElement.style.top = `${yPosition}px`;

    if (isMobile) {
      storyElement.style.transform = 'translate(-50%, -50%)';
    }

    if (text.note) {
      const noteElement = document.createElement('div');
      noteElement.className = 'note';
      noteElement.innerHTML = text.note;

      storyElement.appendChild(noteElement);
    }

    if (text.subnote) {
      const subnoteElement = document.createElement('div');
      subnoteElement.className = 'subnote';

      subnoteElement.innerHTML = text.subnote;

      if (text.sourceText && text.sourceLink) {
        const spaceTextNode = document.createTextNode(' ');
        const sourceElement = document.createElement('a');
        sourceElement.href = text.sourceLink;
        sourceElement.target = '_blank';
        sourceElement.rel = 'noopener noreferrer';
        sourceElement.innerText = text.sourceText;
        subnoteElement.appendChild(spaceTextNode);
        subnoteElement.appendChild(sourceElement);
      }

      storyElement.appendChild(subnoteElement);
    }

    container.appendChild(storyElement);
  });

  if (typeof drawAllAtOnce === 'function') {
    drawAllAtOnce();
    drawGrid();
  }
}
