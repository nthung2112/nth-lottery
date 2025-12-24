import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./en/translation.json";
import viTranslation from "./vi/translation.json";

// Get saved language from localStorage or detect from browser
const savedLanguage = localStorage.getItem("i18nextLng");
const browserLanguage = navigator.language.split("-")[0]; // Get 'en' from 'en-US'
const supportedLanguages = ["en", "vi"];
const defaultLanguage = supportedLanguages.includes(browserLanguage) ? browserLanguage : "en";

i18next.use(initReactI18next).init({
  lng: savedLanguage || defaultLanguage,
  fallbackLng: "en",
  debug: false,
  resources: {
    en: {
      translation: enTranslation,
    },
    vi: {
      translation: viTranslation,
    },
  },
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

// Save language preference to localStorage when it changes
i18next.on("languageChanged", (lng) => {
  localStorage.setItem("i18nextLng", lng);
});
