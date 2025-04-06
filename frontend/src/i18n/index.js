import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      home: "Home",
      post: "Create Post",
      login: "Login with Gmail",
      logout: "Logout",
      admin: "Admin Panel",
      contact: "Contact",
      search: "Search",
    },
  },
  fr: {
    translation: {
      home: "Accueil",
      post: "Créer une annonce",
      login: "Connexion Gmail",
      logout: "Déconnexion",
      admin: "Panneau d'administration",
      contact: "Contact",
      search: "Recherche",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
