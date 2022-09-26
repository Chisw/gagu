import { useEffect } from 'react'
import { AuthApi } from '../../api'
import { useFetch } from '../../hooks'

export default function Settings () {

  const { fetch: getUserList, data } = useFetch(AuthApi.getUserList)

  useEffect(() => {
    getUserList()
  }, [getUserList])

  console.log({ data })

  return (
    <>
      <div className="absolute inset-0">

      </div>
    </>
  )
}
