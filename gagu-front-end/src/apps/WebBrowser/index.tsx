import { useState } from 'react'
import { SvgIcon, ToolButton } from '../../components/common'
import { line } from '../../utils'
import { Button, Input } from '@douyinfe/semi-ui'
import { useHotKey } from '../../hooks'

const websiteList = [
  { group: '', url: 'https://edit.photo' },
  { group: '', url: 'https://webamp.org' },
  { group: '', url: 'https://jspaint.app' },
  { group: '', url: 'https://os.ryo.lu' },
  { group: '', url: 'https://98.js.org' },
  { group: '', url: 'https://winxp.vercel.app' },
  { group: '', url: 'https://desk.glitchy.website' },
  { group: '', url: 'https://calque.io' },
  { group: '', url: 'https://rename.tools' },
  { group: '', url: 'https://map.baidu.com' },
  { group: '', url: 'https://chartogne-taillet.com' },
  { group: '', url: 'https://drawnix.com' },
  { group: '', url: 'https://img.ops-coffee.com' },
  { group: '', url: 'https://www.compumuseum.com' },
  { group: '', url: 'https://citycreator.com' },
  { group: '', url: 'https://gagu.jsw.im' },
  { group: '', url: 'https://mxwy.jsw.im' },
]

const getDomain = (url: string) => {
  return url.replace('https://', '')
}

const getWebsiteFavicon = (url: string) => {
  return `https://www.google.com/s2/favicons?sz=128&domain=${getDomain(url)}`
}

export default function WebBrowser() {
  const [inputUrl, setInputUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeUrl, setActiveUrl] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  useHotKey({
    binding: isFocused,
    fnMap: {
      'Enter, Enter': () => setActiveUrl(inputUrl),
    },
  })

  return (
    <>
      <div className="absolute inset-0 bg-white dark:bg-zinc-900">

        <div className="w-full h-full overflow-y-auto">
          <div className="flex items-center p-4 pb-0">
            <Input
              showClear
              size="large"
              placeholder="URL"
              value={inputUrl}
              onChange={setInputUrl}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            <Button
              className="ml-2"
              size="large"
              theme="solid"
              type="primary"
              icon={<SvgIcon.ArrowRight />}
              onClick={() => setActiveUrl(inputUrl)}
            />
          </div>

          <div className="p-4 grid grid-cols-4 gap-3">
            {websiteList.map(({ url }) => {
              return (
                <div
                  key={getDomain(url)}
                  className="px-4 py-6 cursor-pointer bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 rounded-sm"
                  onClick={() => {
                    setActiveUrl(url)
                    setLoading(true)
                  }}
                >
                  <div className="flex justify-center">
                    <img
                      alt="favicon"
                      className="w-12 h-12 pointer-events-none"
                      src={getWebsiteFavicon(url)}
                    />
                  </div>
                  <div className="mt-2 text-xs text-center text-zinc-400 truncate">
                    {url}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {activeUrl && (
          <div className="absolute z-0 inset-0 flex flex-col bg-zinc-100 dark:bg-zinc-900">
            <div
              className={line(`
                flex items-center shrink-0 h-8 border-t border-b
                border-gray-200 dark:border-zinc-700
                ${loading ? 'bg-loading' : ''}
              `)}
            >
              <ToolButton
                title=""
                icon={<SvgIcon.ArrowLeft />}
                onClick={() => setActiveUrl('')}
              />
              <div className="grow ml-2 text-xs text-zinc-500 text-center">
                {activeUrl}
              </div>
              <ToolButton
                title=""
                icon={<SvgIcon.ExternalLink />}
                onClick={() => window.open(activeUrl)}
              />
            </div>
            <div className="grow">
              <iframe
                key={activeUrl}
                title="web-browser"
                className="w-full h-full"
                src={activeUrl}
                onLoad={() => setLoading(false)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
