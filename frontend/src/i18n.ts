import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import pt from "./i18n/pt.json"
import en from "./i18n/en.json"
import es from "./i18n/es.json"

const resources = {
  pt: { translation: pt },
  en: { translation: en },
  es: { translation: es },
} as const

const savedLang = (localStorage.getItem("lumi.lang") || "pt").slice(0, 2)

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: "pt",
  interpolation: { escapeValue: false },
})

export default i18n
