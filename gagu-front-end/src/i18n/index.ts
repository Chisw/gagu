import i18n, { Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'
import { GAGU_I18N_LANGUAGE_KEY } from '../utils'
import zh_HS from './locales/zh-hans.json'
import zh_HT from './locales/zh-hant.json'
import en_US from './locales/en-US.json'
import ja_JP from './locales/ja-JP.json'
import ru_RU from './locales/ru-RU.json'
import ko_KR from './locales/ko-KR.json'
import fr_FR from './locales/fr-FR.json'
import de_DE from './locales/de-DE.json'
import es_ES from './locales/es-ES.json'
import it_IT from './locales/it-IT.json'
import ar from './locales/ar.json'
import pt_BR from './locales/pt-BR.json'
import bn_BD from './locales/bn-BD.json'
import hi_IN from './locales/hi-IN.json'
import { Locale } from '@douyinfe/semi-ui/lib/es/locale/interface'
import * as semi_zh_HS from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN'
import * as semi_zh_HT from '@douyinfe/semi-ui/lib/es/locale/source/zh_TW'
import * as semi_en_US from '@douyinfe/semi-ui/lib/es/locale/source/en_US'
import * as semi_ja_JP from '@douyinfe/semi-ui/lib/es/locale/source/ja_JP'
import * as semi_ru_RU from '@douyinfe/semi-ui/lib/es/locale/source/ru_RU'
import * as semi_ko_KR from '@douyinfe/semi-ui/lib/es/locale/source/ko_KR'
import * as semi_fr_FR from '@douyinfe/semi-ui/lib/es/locale/source/fr'
import * as semi_de_DE from '@douyinfe/semi-ui/lib/es/locale/source/de'
import * as semi_es_ES from '@douyinfe/semi-ui/lib/es/locale/source/es'
import * as semi_it_IT from '@douyinfe/semi-ui/lib/es/locale/source/it'
import * as semi_ar from '@douyinfe/semi-ui/lib/es/locale/source/ar'
import * as semi_pt_BR from '@douyinfe/semi-ui/lib/es/locale/source/pt_BR'
import * as semi_bn_BD from '@douyinfe/semi-ui/lib/es/locale/source/bn_IN'
import * as semi_hi_IN from '@douyinfe/semi-ui/lib/es/locale/source/hi_IN'

const languageList = [
  { key: 'zh-HS', name: '简体中文', resource: zh_HS },
  { key: 'zh-HT', name: '繁體中文', resource: zh_HT },
  { key: 'en-US', name: 'English', resource: en_US },
  { key: 'ja-JP', name: '日本語', resource: ja_JP },
  { key: 'ru-RU', name: 'Русский', resource: ru_RU },
  { key: 'ko-KR', name: '한국어', resource: ko_KR },
  { key: 'fr-FR', name: 'Français', resource: fr_FR },
  { key: 'de-DE', name: 'Deutsch', resource: de_DE },
  { key: 'es-ES', name: 'Español', resource: es_ES },
  { key: 'it-IT', name: 'Italiano', resource: it_IT },
  { key: 'ar', name: 'العربية', resource: ar },
  { key: 'pt-BR', name: 'Português (Brasil)', resource: pt_BR },
  { key: 'bn-BD', name: 'বাংলা', resource: bn_BD },
  { key: 'hi-IN', name: 'हिन्दी', resource: hi_IN },
]

const semiLocaleMap: { [LANGUAGE: string]: Locale } = {
  'zh-HS': semi_zh_HS.default,
  'zh-HT': semi_zh_HT.default,
  'en-US': semi_en_US.default,
  'ja-JP': semi_ja_JP.default,
  'ru-RU': semi_ru_RU.default,
  'ko-KR': semi_ko_KR.default,
  'fr-FR': semi_fr_FR.default,
  'de-DE': semi_de_DE.default,
  'es-ES': semi_es_ES.default,
  'it-IT': semi_it_IT.default,
  'ar': semi_ar.default,
  'pt-BR': semi_pt_BR.default,
  'bn-BD': semi_bn_BD.default,
  'hi-IN': semi_hi_IN.default,
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
  return languageList.find(lang => lang.key === language)?.key
    || languageList.find(lang => lang.key.split('-')[0] === language.split('-')[0])?.key
    || fallbackLanguage
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
