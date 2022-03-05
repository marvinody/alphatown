const i18nLoaded = (() => {
  return new Promise((resolve, reject) => {
    $.i18n().load({
      'en': '/javascript/i18n/languages/en.json',
      'ja': '/javascript/i18n/languages/ja.json',
    }).done(() => {
      $('body').i18n()
      resolve()
    })
  })
})();

