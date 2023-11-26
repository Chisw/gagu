import { useState } from 'react'

export default function BaiduMap() {

  const [loading, setLoading] = useState(true)

  return (
    <>
      <div className="absolute inset-0">
        {loading && (<div className="absolute z-10 right-0 top-0 left-0 h-1 bg-loading" />)}
        <iframe
          title="app"
          className="w-full h-full"
          src="https://map.baidu.com"
          onLoad={() => setLoading(false)}
        />
      </div>
    </>
  )
}
