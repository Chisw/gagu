import { SideSheet } from '@douyinfe/semi-ui'
import { useEffect, useState } from 'react'
import { DownloadApi } from '../api'
import { useFetch } from '../hooks'
import { IDownloadTunnel } from '../types'
import { getDateTime } from '../utils'
import EntryListPanel from './EntryListPanel'

export default function MySharePanel() {

  const [visible, setVisible] = useState(false)

  const { fetch: getTunnels, data } = useFetch(DownloadApi.getTunnels)

  useEffect(() => {
    getTunnels()
  }, [getTunnels])

  return (
    <>
      <SideSheet
        title="我的分享"
        closable={false}
        placement="left"
        headerStyle={{ padding: '8px 20px', borderBottom: '1px solid #efefef' }}
        maskStyle={{ background: 'rgba(0, 0, 0, .1)' }}
        width={600}
        visible={visible}
        onCancel={() => setVisible(false)}
      >
        <div>
          <div>
            {data?.tunnels.map((tunnel: IDownloadTunnel) => {
              const { code, createdAt, downloadName, entryList, expiredAt, leftTimes, password } = tunnel
              return (
                <div
                  key={code}
                  className="mt-4 border-b"
                >
                  <div className="font-bold">{downloadName}</div>
                  <div className="text-xs text-gray-400">
                    {getDateTime(createdAt)}
                  </div>
                  <EntryListPanel
                    downloadName={downloadName}
                    entryList={entryList}
                    flattenList={[]}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </SideSheet>
    </>
  )
}
