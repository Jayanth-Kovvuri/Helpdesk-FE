import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '@/i18n/locales/ar.json';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
