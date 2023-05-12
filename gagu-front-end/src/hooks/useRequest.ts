import { useCallback, useState } from 'react'

type RequestApi<A extends any[], T> = (...args: A) => Promise<T>

export function useRequest<A extends any[], D>(requestFn: RequestApi<A, D>, initialValue?: D) {

  const [data, setData] = useState<D | undefined>(initialValue)
  const [loading, setLoading] = useState(false)

  const request = useCallback(async (...args: A) => {
    try {
      setLoading(true)
      const data = await requestFn(...args)
      setData(data)
      setLoading(false)
      return data
    } catch (error) {
      setLoading(false)
    }
  }, [requestFn])

  return { request, loading, data, setData }
}
