import { useEffect, useState } from 'react'
import { Confirmor, Opener } from '../../components/common'
import { useRunAppEvent, useUserConfig } from '../../hooks'
import { AppComponentProps, AppId } from '../../types'
import { useTranslation } from 'react-i18next'

const appId = AppId.docReader

export default function DocReader(props: AppComponentProps) {
  const { t } = useTranslation()

  const {
    // matchedEntryList,
    // activeIndex,
    activeEntry,
    activeEntryStreamUrl,
    setActiveIndex,
  } = useRunAppEvent(appId)

  const {
    userConfig: {
      kiloSize,
    },
  } = useUserConfig()

  const [pdfStreamUrl, setPdfStreamUrl] = useState('')

  useEffect(() => {
    if (activeEntry) {
      const { size } = activeEntry
      if (size && size > (100 * kiloSize * kiloSize)) {
          Confirmor({
            type: 'tip',
            content: t('tip.sureToOpenLargeFile', { size: '100MB' }),
            onConfirm: (close) => {
              setPdfStreamUrl(activeEntryStreamUrl)
              close()
            },
            onCancel: (close) => {
              setActiveIndex(-1)
              close()
            },
          })
      } else {
        setPdfStreamUrl(activeEntryStreamUrl)
      }
    }
  }, [t, activeEntry, setActiveIndex, kiloSize, activeEntryStreamUrl])

  return (
    <>
      <div className="absolute z-0 inset-0 bg-orange-950">

        <Opener show={!activeEntry} appId={appId} />

        {!!activeEntry && (
          <iframe
            title="pdf"
            className="w-full h-full"
            src={pdfStreamUrl}
          />
        )}

      </div>
    </>
  )
}
