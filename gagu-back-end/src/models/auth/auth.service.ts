import { Injectable } from '@nestjs/common'
import { readFileSync } from 'fs'
import { IUserListData } from 'src/types'
import { USER_LIST_DATA_PATH } from 'src/utils'

@Injectable()
export class AuthService {
  getUserList() {
    const dataStr = readFileSync(USER_LIST_DATA_PATH).toString('utf-8')
    const userListData: IUserListData = JSON.parse(dataStr)
    const { userList } = userListData
    return userList
  }

  getUser(username: string) {
    const userList = this.getUserList()
    const user = userList.find((u) => u.username === username)
    return user
  }
}
