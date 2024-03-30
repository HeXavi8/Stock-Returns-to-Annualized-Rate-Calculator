import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import resources from '../locales/index';

// https://www.i18next.com/overview/configuration-options
i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "zh",
		lng: "zh",
		debug: true,
		interpolation: {
			escapeValue: false,
		}
	});

export default i18n;
