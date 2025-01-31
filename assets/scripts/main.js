function loadLanguage(lang) {
  fetch('./assets/translations/translation.json')
    .then((response) => response.json())
    .then((data) => {
      applyTranslations(data[lang]);
      if (window.p5Instance) {
        window.p5Instance.updateData({
          months: data[lang].months,
          notes: data[lang].notes,
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
