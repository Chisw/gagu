import i18n, { Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { GAGU_I18N_LANGUAGE_KEY } from '../utils'
import zh_HS from './locales/zh-hans.json'
import zh_HT from './locales/zh-hant.json'
import en_US from './locales/en-US.json'
import ja_JP from './locales/ja-JP.json'
import { Locale } from '@douyinfe/semi-ui/lib/es/locale/interface'
import * as semi_zh_HS from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN'
import * as semi_zh_HT from '@douyinfe/semi-ui/lib/es/locale/source/zh_TW'
import * as semi_en_US from '@douyinfe/semi-ui/lib/es/locale/source/en_US'
import * as semi_ja_JP from '@douyinfe/semi-ui/lib/es/locale/source/ja_JP'

const languageList = [
  { key: 'zh-HS', name: '简体中文', resource: zh_HS },
  { key: 'zh-HT', name: '繁體中文', resource: zh_HT },
  { key: 'en-US', name: 'English', resource: en_US },
  { key: 'ja-JP', name: '日本語', resource: ja_JP },
]

const semiLocaleMap: { [LANGUAGE: string]: Locale } = {
  'zh-HS': semi_zh_HS.default,
  'zh-HT': semi_zh_HT.default,
  'en-US': semi_en_US.default,
  'ja-JP': semi_ja_JP.default,
}

const resources: Resource = Object.fromEntries(languageList.map(lang => [lang.key, lang.resource]))

const fallbackLanguage = languageList[0].key

const navigatorLanguage = (function() {
  const { language } = navigator
  if (['zh-CN', 'zh-SG', 'zh-MY'].includes(language)) {
    return 'zh-HS'
  } else if (['zh-TW', 'zh-HK', 'zh-MO'].includes(language)) {
    return 'zh-HT'
  }
  return language
}());

const storedLanguage = localStorage.getItem(GAGU_I18N_LANGUAGE_KEY)

const matchedStoredLanguage =
  storedLanguage && languageList.map(lang => lang.key).includes(storedLanguage) ? storedLanguage : ''

const language = matchedStoredLanguage || navigatorLanguage

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: fallbackLanguage,
    lng: language,
    interpolation: {
      escapeValue: false,
    },
    pluralSeparator: '_',
  })

const setLanguage = (language: string) => {
  localStorage.setItem(GAGU_I18N_LANGUAGE_KEY, language)
  i18n.changeLanguage(language)
}

export {
  languageList,
  semiLocaleMap,
  setLanguage,
}

export default i18n
