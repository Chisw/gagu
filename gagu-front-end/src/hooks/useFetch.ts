import { useCallback, useState } from 'react'

type RequestApi<A extends any[], T> = (...args: A) => Promise<T>

export default function useFetch<A extends any[], D>(fetchFn: RequestApi<A, D>, initialValue?: D) {

  const [data, setData] = useState<D | undefined>(initialValue)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async (...args: A) => {
    try {
      setLoading(true)
      const data = await fetchFn(...args)
      setData(data)
      setLoading(false)
      return data
    } catch (error) {
      setLoading(false)
    }
  }, [fetchFn])

  return { fetch, loading, data, setData }
}
