import { useCallback, useState } from 'react'

const { localStorage } = window

export default function useLocalStorage<T>(key: string, initialValue: T) {

  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : initialValue
  })

  const setAndStoreValue = useCallback((value: T) => {
    setValue(value)
    localStorage.setItem(key, JSON.stringify(value))
  }, [key])

  return [value, setAndStoreValue] as [T, (val: T) => void]
}
