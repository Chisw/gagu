import { useCallback, useState } from 'react'

type RequestFn<A extends any[], T> = (...args: A) => Promise<T>

export function useRequest<A extends any[], D>(requestFn: RequestFn<A, D>, initialData?: D) {

  const [data, setData] = useState<D | undefined | null>(initialData)
  const [loading, setLoading] = useState(false)

  const request = useCallback(async (...args: A) => {
    try {
      setLoading(true)
      const data = await requestFn(...args)
      setLoading(false)
      setData(data)
      return data as D
    } catch (error) {
      setLoading(false)
      // TODO: handle error string
      const fallbackData = { success: false, message: `${error}`} as D
      setData(fallbackData)
      return fallbackData
    }
  }, [requestFn])

  return { request, loading, data, setData }
}
