import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import XHR from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
const lngList = ['de', 'en', 'es-AR', 'es-US', 'it-IT', 'iw', 'jp', 'ko', 'ro', 'ru', 'vu', 'zh-CN', 'zh-TW' ]
const locale = navigator.language

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
    //fallbackLng: 'en',
    //preload: ['en'],
    keySeparator: false,
    interpolation: { escapeValue: false }
  })

localStorage.setItem('i18nextLng', locale);
window.addEventListener('storage', () => {
  if(!localStorage.getItem('i18nextLng')) localStorage.setItem('i18nextLng', locale);
  let storageLng = localStorage.getItem('i18nextLng');
  let result = lngList.find(l => l === storageLng.split('-')[0]);
  if(!result) {
    localStorage.setItem('i18nextLng', 'en-EN')
  } else {
    localStorage.setItem('i18nextLng', storageLng)
  }
});

export default i18next
