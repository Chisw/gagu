import { Injectable } from '@nestjs/common'
import { User, IUser, IUserForm } from 'src/types'
import { readUsersData, writeUsersData } from 'src/utils'

@Injectable()
export class UserService {
  private userList: IUser[] = []

  constructor() {
    this.userList = readUsersData()
  }

  sync() {
    writeUsersData(this.userList)
  }

  findAll() {
    const publicUserList: IUser[] = JSON.parse(JSON.stringify(this.userList))
    publicUserList.forEach((user) => (user.password = ''))
    return publicUserList
  }

  findOne(username: User.Username) {
    return this.userList.find((user) => user.username === username)
  }

  create(userForm: IUserForm) {
    const {
      nickname,
      username,
      password,
      expiredAt,
      permissionList,
      rootEntryPathList,
    } = userForm

    const user: IUser = {
      nickname,
      username,
      password,
      disabled: false,
      createdAt: Date.now(),
      expiredAt,
      permissionList,
      rootEntryPathList,
    }

    this.userList.push(user)
    this.sync()
  }

  update(userForm: IUserForm) {
    const {
      nickname,
      username,
      password,
      expiredAt,
      permissionList,
      rootEntryPathList,
    } = userForm

    const user = this.userList.find((u) => u.username === username)

    if (user) {
      user.nickname = nickname
      user.expiredAt = expiredAt
      user.permissionList = permissionList
      user.rootEntryPathList = rootEntryPathList
      if (password) {
        user.password = password
      }
      this.sync()
    }
  }

  remove(username: User.Username) {
    this.userList = this.userList.filter((u) => u.username !== username)
    this.sync()
  }

  updateAbility(username: User.Username, enable: boolean) {
    const user = this.userList.find((user) => user.username === username)
    if (user) {
      user.disabled = !enable
    }
    this.sync()
  }
}
