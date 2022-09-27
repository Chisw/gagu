import { Injectable } from '@nestjs/common'
import { User, IUser } from 'src/types'
import { readUsersData, writeUsersData } from 'src/utils'

@Injectable()
export class AuthService {
  private userList: IUser[] = []
  private loggedInMap: { [TOKEN: User.Token]: User.Username } = {}

  constructor() {
    const list = readUsersData()
    this.userList = list
  }

  getUserList() {
    return this.userList
  }

  getUser(username: string) {
    return this.userList.find((u) => u.username === username)
  }

  addUser(user: IUser) {
    this.userList.push(user)
    writeUsersData(this.userList)
  }

  updateUser(user: IUser) {
    const index = this.userList.findIndex((u) => u.username === user.username)
    this.userList.splice(index, 1, user)
    writeUsersData(this.userList)
  }

  removeUser(username: User.Username) {
    this.userList = this.userList.filter((u) => u.username !== username)
    writeUsersData(this.userList)
  }

  addLoggedInMap(token: User.Token, username: User.Username) {
    this.loggedInMap[token] = username
  }

  getLoggedInMap() {
    return this.loggedInMap
  }

  getLoggedInUser(token: string) {
    const loggedInUser = this.loggedInMap[token] as User.Username | undefined
    return loggedInUser
  }

  removeLoggedInUser(token: string) {
    delete this.loggedInMap[token]
  }
}
