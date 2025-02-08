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

function updateLabelsScript(languageData, lang) {
  const container = document.getElementById('stories');
  container.innerHTML = '';

  const MONTH_HEIGHT = 400;
  const TOP_PADDING = 24;
  const monthPositions = {};

  languageData.months.forEach((month, index) => {
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
    monthElement.className = 'month-label';
    monthElement.innerHTML = monthKey;
    monthElement.style.top = `${monthTop}px`;
    container.appendChild(monthElement);
  });

  languageData.notes.forEach((noteData) => {
    let yPosition = 0;
    if (noteData.month) {
      const monthKey = noteData.year
        ? `${noteData.month} ${noteData.year}`
        : noteData.month;
      const monthPosition = monthPositions[monthKey];

      if (monthPosition) {
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
      }
    }

    let xPosition = container.offsetWidth / 2;
    if (noteData.xPlacement) {
      switch (noteData.xPlacement) {
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
    storyElement.style.transform = noteData.centered
      ? 'translate(-50%, -50%)'
      : 'none';
    storyElement.style.textAlign = noteData.centered ? 'center' : 'left';

    if (noteData.note) {
      const noteElement = document.createElement('div');
      noteElement.className = 'note';
      noteElement.innerHTML = noteData.note;
      storyElement.appendChild(noteElement);
    }

    if (noteData.subnote) {
      const subnoteElement = document.createElement('div');
      subnoteElement.className = 'subnote';
      subnoteElement.style.maxWidth = '23rem';
      subnoteElement.innerHTML = noteData.subnote;

      if (noteData.sourceText && noteData.sourceLink) {
        const spaceTextNode = document.createTextNode(' ');
        const sourceElement = document.createElement('a');
        sourceElement.href = noteData.sourceLink;
        sourceElement.target = '_blank';
        sourceElement.rel = 'noopener noreferrer';
        sourceElement.innerText = noteData.sourceText;

        subnoteElement.appendChild(spaceTextNode);
        subnoteElement.appendChild(sourceElement);
      }

      storyElement.appendChild(subnoteElement);
    }

    container.appendChild(storyElement);
  });

  if (typeof drawAllAtOnce === 'function' && previousLanguage !== lang) {
    drawAllAtOnce();
    previousLanguage = lang;
  }
}
