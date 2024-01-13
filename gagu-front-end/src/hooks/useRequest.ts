import { useCallback, useState } from 'react'

type RequestFn<A extends any[], T> = (...args: A) => Promise<T>

export function useRequest<A extends any[], D>(requestFn: RequestFn<A, D>, initialResponse?: D) {

  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<D | undefined | null>(initialResponse)

  const request = useCallback(async (...args: A) => {
    try {
      setLoading(true)

      const res = await requestFn(...args)

      setLoading(false)
      setResponse(res)

      return res as D
    } catch (error) {
      setLoading(false)
      const fallbackData = {
        success: false,
        message: `${error}`,
      } as D

      setResponse(fallbackData)
      return fallbackData
    }
  }, [requestFn])

  return { request, loading, response, setResponse }
}
