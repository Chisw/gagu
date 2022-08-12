import { useRecoilState } from 'recoil'
import { line } from '../utils'
import { uploadTaskListState } from '../utils/state'


export default function Transfer() {

  const [uploadTaskList] = useRecoilState(uploadTaskListState)

  return (
    <>
      <div className="absolute inset-0 p-1">
        <span className="ml-1 font-din">
          {uploadTaskList.filter(t => t.status === 'success').length}
          /{uploadTaskList.length}
        </span>
        <div>
          {uploadTaskList.map((task, taskIndex) => {
            const { id, nestedFile: { name }, status } = task
            const isSuccess = status === 'success'
            const len = uploadTaskList.length.toString().length
            const indexStr = `${(taskIndex + 1).toString().padStart(len, '0')}`
            return (
              <div
                key={id}
                className="py-1 text-xs flex justify-between items-center"
              >
                <span>{indexStr}. {name}</span>
                &nbsp;
                <span
                  className={line(`
                    inline-block px-2 py-1 text-white rounded-full
                    ${isSuccess ? 'bg-green-500' : 'bg-gray-400'}
                  `)}
                >
                  {status}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
