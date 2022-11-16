import { Button, Form, Modal } from '@douyinfe/semi-ui'
import { IEntry } from '../types'
import EntryListPanel from './EntryListPanel'

interface ShareModalProps {
  visible: boolean
  entryList: IEntry[]
  onClose: () => void
}

export default function ShareModal(props: ShareModalProps) {

  const {
    visible,
    entryList,
    onClose,
  } = props

  return (
    <>
      <Modal
        centered
        title="创建分享链接"
        width={640}
        visible={visible}
        footer={(
          <div className="flex justify-end">
            <Button
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              theme="solid"
              className="w-32"
            >
              创建
            </Button>
          </div>
        )}
        onCancel={onClose}
      >
        <EntryListPanel
          downloadName={''}
          entryList={entryList}
          flattenList={[]}
        />
        <div className="mt-4">
          <Form initValues={{}}>
            <div className="flex">
              <div className="w-1/3">
                <Form.DatePicker
                  showClear
                  field="dateTime"
                  label="有效期"
                  placeholder="留空不限"
                  format="yyyy-MM-dd HH:mm"
                />
              </div>
              <div className="mx-3 w-1/3">
                <Form.Input
                  showClear
                  field="password"
                  label="访问密码"
                  placeholder="留空不限"
                  type="password"
                />
              </div>
              <div className="w-1/3">
                <Form.InputNumber
                  showClear
                  field="leftTimes"
                  label="可下载次数"
                  placeholder="留空不限"
                  min={1}
              />
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  )
}
