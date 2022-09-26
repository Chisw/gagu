import { Injectable } from '@nestjs/common'
import { readFileSync, writeFileSync } from 'fs'
import { User, IUser, IUserListData } from 'src/types'
import { GAGU_VERSION, USER_LIST_DATA_PATH } from 'src/utils'

@Injectable()
export class AuthService {
  private userList: IUser[] = []
  private loggedInUserMap: { [TOKEN: User.Token]: User.Username } = {}

  constructor() {
    const list = this.readUserListData()
    this.userList = list
  }

  readUserListData() {
    const dataStr = readFileSync(USER_LIST_DATA_PATH).toString('utf-8')
    const userListData: IUserListData = JSON.parse(dataStr)
    const { version, userList } = userListData
    // TODO: handle user version
    return userList
  }

  writeUserListData() {
    const userListData: IUserListData = {
      version: GAGU_VERSION,
      userList: this.userList,
    }
    writeFileSync(USER_LIST_DATA_PATH, JSON.stringify(userListData))
  }

  getUserList() {
    return this.userList
  }

  getUser(username: string) {
    return this.userList.find((u) => u.username === username)
  }

  addUser(user: IUser) {
    this.userList.push(user)
    this.writeUserListData()
  }

  addLoggedInMap(token: User.Token, username: User.Username) {
    this.loggedInUserMap[token] = username
  }

  getLoggedInMap() {
    return this.loggedInUserMap
  }

  getLoggedInUser(token: string) {
    const loggedInUser = this.loggedInUserMap[token] as User.Username | undefined
    return loggedInUser
  }

  removeLoggedInUser(token: string) {
    delete this.loggedInUserMap[token]
  }
}
