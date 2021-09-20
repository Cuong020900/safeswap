import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import XHR from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
const locale = navigator.language;


i18next
  .use(XHR)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `./locales/{{lng}}.json`
    },
    react: {
      useSuspense: true
    },
    fallbackLng: 'en',
    preload: ['en'],
    keySeparator: false,
    interpolation: { escapeValue: false }
  })

localStorage.setItem('i18nextLng', locale);
window.addEventListener('storage', () => {
  let storageLng = localStorage.getItem('i18nextLng');
  if(storageLng !== locale) localStorage.setItem('i18nextLng', locale);
});

export default i18next
