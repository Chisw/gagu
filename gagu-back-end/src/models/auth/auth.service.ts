import { Injectable } from '@nestjs/common'
import { User, IUser, ILoginMap } from 'src/types'
import {
  readLoginData,
  readUsersData,
  writeLoginData,
  writeUsersData,
} from 'src/utils'

@Injectable()
export class AuthService {
  private userList: IUser[] = []
  private loginMap: ILoginMap = {}

  constructor() {
    this.userList = readUsersData()
    this.loginMap = readLoginData()
  }

  // user list
  syncUsersData() {
    writeUsersData(this.userList)
  }

  getUserList() {
    return this.userList
  }

  getUser(username: string) {
    return this.userList.find((u) => u.username === username)
  }

  addUser(user: IUser) {
    this.userList.push(user)
    this.syncUsersData()
  }

  updateUser(user: IUser) {
    const index = this.userList.findIndex((u) => u.username === user.username)
    this.userList.splice(index, 1, user)
    this.syncUsersData()
  }

  removeUser(username: User.Username) {
    this.userList = this.userList.filter((u) => u.username !== username)
    this.removeLoginRecord(username)
    this.syncUsersData()
  }

  // login map
  syncLoginData() {
    writeLoginData(this.loginMap)
  }

  getLoginMap() {
    return this.loginMap
  }

  getLoginUsername(token: string) {
    const loginUsername = this.loginMap[token] as User.Username | undefined
    return loginUsername
  }

  addLoginRecord(token: User.Token, username: User.Username) {
    this.loginMap[token] = username
    this.syncLoginData()
  }

  removeLoginRecord(username: User.Username) {
    const entries = Object.entries(this.loginMap).filter(
      ([, userName]) => userName !== username,
    )
    this.loginMap = Object.fromEntries(entries)
    this.syncLoginData()
  }
}
