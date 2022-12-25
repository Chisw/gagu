import { useTranslation } from 'react-i18next'
import { languageList, setLanguage } from '../../../i18n'
import { line } from '../../../utils'

export default function GeneralSettings() {
  const { i18n: { language } } = useTranslation()

  return (
    <>
      <div>
        <div></div>
        <div>
          {languageList.map(({ key, name }) => (
            <div
              key={key}
              className={line(`
                inline-block mr-2 px-3 py-1 border rounded cursor-pointer select-none
                ${key === language ? 'border-blue-600' : 'hover:border-blue-300'}
              `)}
              onClick={() => setLanguage(key)}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}