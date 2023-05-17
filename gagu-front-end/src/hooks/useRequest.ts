import { useCallback, useState } from 'react'

type RequestFn<A extends any[], T> = (...args: A) => Promise<T>

export function useRequest<A extends any[], D>(requestFn: RequestFn<A, D>, initialValue?: D) {

  const [data, setData] = useState<D | undefined>(initialValue)
  const [loading, setLoading] = useState(false)

  const request = useCallback(async (...args: A) => {
    try {
      setLoading(true)
      const data = await requestFn(...args)
      setLoading(false)
      setData(data)
      return data
    } catch (error) {
      setLoading(false)
      const fallbackData: any = { success: false, message: `${error}`}
      setData(fallbackData)
      return fallbackData
    }
  }, [requestFn])

  return { request, loading, data, setData }
}
