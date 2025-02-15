let currentLanguageData = null;

function loadLanguage(lang) {
  fetch('./assets/translations/translation.json')
    .then((response) => response.json())
    .then((data) => {
      applyTranslations(data[lang]);
      currentLanguageData = data[lang];
      updateLabelsScript(currentLanguageData);
      initializeGrid(currentLanguageData);
      if (window.p5Instance) {
        window.p5Instance.updateData({
          months: data[lang].months,
          stories: data[lang].stories,
          stat: data[lang].stat,
        });
      }
    });
}

function applyTranslations(translations) {
  for (const key in translations) {
    const elements = document.querySelectorAll(`#${key}`);
    elements.forEach((element) => {
      element.innerHTML = translations[key];
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadLanguage('en');
});

function selectLanguage(lang) {
  loadLanguage(lang);
  document
    .querySelectorAll('.language-option')
    .forEach((el) => el.classList.remove('selected'));
  document
    .querySelector(`.language-option[onclick="selectLanguage('${lang}')"]`)
    .classList.add('selected');
}

async function fetchCSV() {
  const response = await fetch(csvPath);
  const csvText = await response.text();

  const rows = csvText.split('\n').map((row) => row.split(','));
  const headers = rows.shift();
  const data = rows.map((row) => {
    const rowObject = {};
    headers.forEach((header, i) => {
      rowObject[header.trim()] = row[i].trim();
    });
    return rowObject;
  });

  return data;
}
