import { Popover } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { languageList, setLanguage } from '../../i18n'
import { line } from '../../utils'
import { SvgIcon } from '.'

export function PublicFooter() {
  const { i18n: { language } } = useTranslation()

  return (
    <>
      <div className="absolute bottom-0 py-4 w-full text-xs text-white flex justify-center items-center">
        <a
          rel="noreferrer"
          href="https://gagu.io"
          target="_blank"
          className="opacity-60 hover:opacity-80 font-g"
        >
          GAGU.IO
        </a>
        <span className="opacity-50">&emsp;|&emsp;</span>
        <Popover
          showArrow
          position="top"
          className="semi-always-dark"
          trigger="click"
          content={(
            <div className="-my-2">
              {languageList.map(({ key, name }) => (
                <div
                  key={key}
                  className={line(`
                    my-2 px-1 cursor-pointer select-none text-sm text-white text-center
                    ${key === language ? 'opacity-100' : 'opacity-50 hover:opacity-100'}
                  `)}
                  onClick={() => setLanguage(key)}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        >
          <span className="inline-block opacity-60 hover:opacity-80 cursor-pointer">
            <SvgIcon.Global size={12} />
          </span>
        </Popover>
      </div>
    </>
  )
}