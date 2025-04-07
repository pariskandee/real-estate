// frontend/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Manual translations instead of backend loader
const resources = {
  en: {
    translation: {
      "welcome": "Welcome",
      "properties": "Properties"
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue",
      "properties": "Propriétés"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'navigator'],
      lookupQuerystring: 'lang'
    }
  });

export default i18n;