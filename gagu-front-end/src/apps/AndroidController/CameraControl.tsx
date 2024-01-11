import { useCallback, useEffect, useMemo } from 'react'
import { AndroidApi } from '../../api'
import { useRequest } from '../../hooks'
import { Button, Descriptions } from '@douyinfe/semi-ui'
import { SvgIcon } from '../../components/common'
import toast from 'react-hot-toast'

export default function CameraControl() {
  const { request: queryCameraInfo, loading, data: cameraInfoData } = useRequest(AndroidApi.queryCameraInfo)
  const { request: createCameraPhoto, loading: creating } = useRequest(AndroidApi.createCameraPhoto)

  const cameraDataList = useMemo(() => {
    return (cameraInfoData?.data || []).map((cameraInfo) => {
      const {
        id,
        auto_exposure_modes,
        capabilities,
        facing,
        focal_lengths,
        jpeg_output_sizes,
        physical_size,
      } = cameraInfo

      return [
        { key: 'id', value: id },
        { key: 'auto_exposure_modes', value: auto_exposure_modes?.join(', ') },
        { key: 'capabilities', value: capabilities?.join(', ') },
        { key: 'facing', value: facing },
        { key: 'focal_lengths', value: focal_lengths?.map(f => f.toFixed(2)).join(', ') },
        { key: 'jpeg_output_sizes', value: jpeg_output_sizes?.map(({ width, height }) => `${width}×${height}`).join(', ') },
        { key: 'physical_size', value: `${physical_size?.width.toFixed(2)}×${physical_size?.height.toFixed(2)}` },
      ]
    })
  }, [cameraInfoData?.data])

  const handleCreateCameraPhoto = useCallback(async (cameraId: string) => {
    const { success, data: { path } } = await createCameraPhoto(cameraId)
    if (success) {
      toast.success(path)
    }
  }, [createCameraPhoto])

  useEffect(() => {
    queryCameraInfo()
  }, [queryCameraInfo])

  return (
    <>
      <div className="relative h-64 overflow-y-auto">
        <Button
          icon={<SvgIcon.Refresh />}
          className="absolute top-0 right-0"
          loading={loading}
          onClick={queryCameraInfo}
        />
        {cameraDataList.map((data, dataIndex) => (
          <div
            key={dataIndex}
          >
            <Button
              icon={<SvgIcon.Camera />}
              loading={creating}
              onClick={() => handleCreateCameraPhoto(cameraDataList[dataIndex][0].value)}
            />
            <Descriptions
              align="left"
              data={data}
            />
          </div>
        ))}
      </div>
    </>
  )
}
