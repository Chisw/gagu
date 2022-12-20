import i18n, { Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import en_US from './locales/en-US.json'
import zh_CN from './locales/zh-CN.json'

const I18N_LOCALE_KEY = 'GAGU_I18N_LOCALE'

const languageList = [
  { key: 'en-US', name: 'English', resource: en_US },
  { key: 'zh-CN', name: '简体中文', resource: zh_CN },
]

const resources: Resource = Object.fromEntries(languageList.map(lang => [lang.key, lang.resource]))

const fallbackLng = languageList[0].key

const storedLocale = localStorage.getItem(I18N_LOCALE_KEY)

const matchedStoredLocale =
  storedLocale && languageList.map(lang => lang.key).includes(storedLocale) ? storedLocale : ''

const lng = matchedStoredLocale || navigator.language || fallbackLng

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng,
    lng,
    interpolation: {
      escapeValue: false,
    }
  })

const setLocale = (locale: string) => {
  localStorage.setItem(I18N_LOCALE_KEY, locale)
  i18n.changeLanguage(locale)
}

const { t: _t } = i18n

export default i18n

export {
  _t,
  languageList,
  setLocale,
}
