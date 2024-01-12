import { useCallback, useState } from 'react'
import { useRequest } from '../../hooks'
import { TermuxApi } from '../../api'
import { Slider, Switch } from '@douyinfe/semi-ui'
import { BrightnessType } from '../../types'

const DEFAULT_VALUE = 10

export default function Brightness() {

  const [brightness, setBrightness] = useState<BrightnessType>(DEFAULT_VALUE)
  const [isAuto, setIsAuto] = useState(false)

  const { request: updateBrightness, loading } = useRequest(TermuxApi.updateBrightness)

  const handleUpdateBrightness = useCallback((brightness: BrightnessType) => {
    setBrightness(brightness)
    setIsAuto(brightness === 'auto')
    updateBrightness({ brightness })
  }, [updateBrightness])

  return (
    <>
      <div className="relative">
        <div className="flex items-center">
          <Switch
            checked={isAuto}
            onChange={checked => handleUpdateBrightness(checked ? 'auto' : DEFAULT_VALUE)}
          />
          <span className="ml-2">Auto</span>
        </div>
        <div className="my-4 flex items-center">
          <div className="flex-grow">
            <Slider
              step={1}
              min={1}
              max={255}
              showBoundary={false}
              disabled={isAuto || loading}
              onAfterChange={(value) => handleUpdateBrightness(value as number)}
            />
          </div>
          <div className="flex-shrink-0 w-8 text-right text-lg font-din">{brightness}</div>
        </div>
      </div>
    </>
  )
}
