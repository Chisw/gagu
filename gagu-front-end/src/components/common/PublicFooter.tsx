import { Popover } from '@douyinfe/semi-ui'
import { useTranslation } from 'react-i18next'
import { languageList, setLanguage } from '../../i18n'
import { DURATION_PAGE, line } from '../../utils'
import { SvgIcon } from '.'
import { GAGU_VERSION, GAGU_WEBSITE } from '@shared'
import { motion } from 'motion/react'
import { useRecoilState } from 'recoil'
import { activePageState } from '../../states'
import { useMemo } from 'react'
import { Page } from '../../types'

export function PublicFooter() {
  const { i18n: { language } } = useTranslation()
  const [activePage] = useRecoilState(activePageState)

  const isPending = useMemo(() => activePage === Page.PENDING, [activePage])

  return (
    <>
      <motion.div
        className="flex-center-center absolute bottom-0 py-4 w-full text-xs text-white/50"
        initial={{ opacity: 0, y: 20 }}
        animate={isPending ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        transition={{ duration: DURATION_PAGE / 1000 }}
      >
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
          <span className="inline-block hover:text-white/80 cursor-pointer">
            <SvgIcon.Global size={12} />
          </span>
        </Popover>
        <span>&emsp;|&emsp;</span>
        <a
          rel="noreferrer"
          href={GAGU_WEBSITE}
          target="_blank"
          className="hover:text-white/80 font-g"
        >
          GAGU
        </a>
        <span className="ml-1">
          v{GAGU_VERSION}
        </span>
      </motion.div>
    </>
  )
}