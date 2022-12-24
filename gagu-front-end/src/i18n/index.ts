import i18n, { Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import zh_hans from './locales/zh-hans.json'
import zh_hant from './locales/zh-hant.json'
import en_US from './locales/en-US.json'
import ja_JP from './locales/ja-JP.json'

const I18N_LANGUAGE_KEY = 'GAGU_I18N_LANGUAGE'

const languageList = [
  { key: 'zh-HS', icon: '🇨🇳', name: '简体中文', resource: zh_hans },
  { key: 'zh-HT', icon: '🇨🇳', name: '繁體中文', resource: zh_hant },
  { key: 'en-US', icon: '🇺🇸', name: 'English', resource: en_US },
  { key: 'ja-JP', icon: '🇯🇵', name: '日本語', resource: ja_JP },
]

const resources: Resource = Object.fromEntries(languageList.map(lang => [lang.key, lang.resource]))

const fallbackLanguage = languageList[0].key

const navLanguage = (function() {
  const { language: lang } = navigator
  if (['zh-CN', 'zh-SG', 'zh-MY'].includes(lang)) {
    return 'zh-HS'
  } else if (['zh-TW', 'zh-HK', 'zh-MO'].includes(lang)) {
    return 'zh-HT'
  }
  return lang
}());

const storedLanguage = localStorage.getItem(I18N_LANGUAGE_KEY)

const matchedStoredLanguage =
  storedLanguage && languageList.map(lang => lang.key).includes(storedLanguage) ? storedLanguage : ''

const language = matchedStoredLanguage || navLanguage
console.log(resources[language], language)

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: fallbackLanguage,
    lng: language,
    interpolation: {
      escapeValue: false,
    }
  })

const setLanguage = (language: string) => {
  localStorage.setItem(I18N_LANGUAGE_KEY, language)
  i18n.changeLanguage(language)
}

export default i18n

export {
  languageList,
  setLanguage,
}
