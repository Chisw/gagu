import { Button } from '@douyinfe/semi-ui'
import { useRequest } from '../../hooks'
import { TermuxApi } from '../../api'
import { useCallback, useState } from 'react'
import { SvgIcon } from '../../components/common'
import { EntryPicker, EntryPickerMode } from '../../components'
import { AppId, EntryType, MediaPlayerStateType } from '../../types'
import { useTranslation } from 'react-i18next'

export default function MediaPlayer() {

  const { t } = useTranslation()

  const [pickerShow, setPickerShow] = useState(false)
  const [pickedPath, setPickedPath] = useState('')

  const { request: queryMediaPlayerInfo, loading, response } = useRequest(TermuxApi.queryMediaPlayerInfo)
  const { request: createMediaPlayerPlay, loading: creating } = useRequest(TermuxApi.createMediaPlayerPlay)
  const { request: updateMediaPlayerState, loading: updating } = useRequest(TermuxApi.updateMediaPlayerState)

  const handleQuery = useCallback(() => {
    queryMediaPlayerInfo()
  }, [queryMediaPlayerInfo])

  const handleCreatePlay = useCallback(() => {
    createMediaPlayerPlay(pickedPath)
  }, [createMediaPlayerPlay, pickedPath])

  const handleUpdatePlay = useCallback((state: MediaPlayerStateType) => {
    updateMediaPlayerState(state)
  }, [updateMediaPlayerState])

  return (
    <>
      <div className="relative h-64 overflow-y-auto">
        <div>
          <Button
            icon={<SvgIcon.Refresh />}
            loading={loading}
            onClick={handleQuery}
          />
          <Button
            icon={<SvgIcon.FolderOpen />}
            onClick={() => setPickerShow(true)}
          />
          <Button
            icon={<SvgIcon.Eject />}
            disabled={!pickedPath}
            loading={creating}
            onClick={handleCreatePlay}
          />
          <Button
            icon={<SvgIcon.Play />}
            disabled={!pickedPath}
            loading={updating}
            onClick={() => handleUpdatePlay('play')}
          />
          <Button
            icon={<SvgIcon.Pause />}
            disabled={!pickedPath}
            loading={updating}
            onClick={() => handleUpdatePlay('pause')}
          />
          <Button
            icon={<SvgIcon.Stop />}
            disabled={!pickedPath}
            loading={updating}
            onClick={() => handleUpdatePlay('stop')}
          />
        </div>
        <div className="mt-2 text-xs">{pickedPath}</div>
        <div className="mt-2 text-xs">{JSON.stringify(response?.data)}</div>
      </div>


      <EntryPicker
        show={pickerShow}
        appId={AppId.androidController}
        mode={EntryPickerMode.open}
        type={EntryType.file}
        title={t`action.open`}
        onConfirm={({ pickedPath }) => {
          setPickedPath(pickedPath)
          setPickerShow(false)
        }}
        onCancel={() => setPickerShow(false)}
      />
    </>
  )
}
