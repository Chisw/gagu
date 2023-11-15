import { Injectable } from '@nestjs/common'
import { User, IUser, IUserForm } from '../../types'
import { readUsersData, writeUsersData } from '../../utils'

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
      permissions,
      assignedPathList,
      favoritePathList,
    } = userForm

    const user: IUser = {
      nickname,
      username,
      password,
      invalid: false,
      createdAt: Date.now(),
      expiredAt,
      permissions,
      assignedPathList,
      favoritePathList,
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
      permissions,
      assignedPathList,
      favoritePathList,
    } = userForm

    const user = this.userList.find((u) => u.username === username)

    if (user) {
      user.nickname = nickname
      user.expiredAt = expiredAt
      user.permissions = permissions
      user.assignedPathList = assignedPathList
      user.favoritePathList = favoritePathList
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

  updateValidity(username: User.Username, isValid: boolean) {
    const user = this.userList.find((user) => user.username === username)
    if (user) {
      user.invalid = !isValid
      this.sync()
    }
  }

  queryFavorite(username: User.Username) {
    const user = this.userList.find((user) => user.username === username)
    return user?.favoritePathList || []
  }

  createFavorite(username: User.Username, path: string) {
    const user = this.userList.find((user) => user.username === username)
    if (user) {
      const list = Array.from(new Set([...(user.favoritePathList || []), path]))
      user.favoritePathList = list
      this.sync()
      return list
    } else {
      return []
    }
  }

  removeFavorite(username: User.Username, path: string) {
    const user = this.userList.find((user) => user.username === username)
    if (user) {
      const list = user.favoritePathList?.filter((p) => p !== path) || []
      user.favoritePathList = list
      this.sync()
      return list
    } else {
      return []
    }
  }

  removeAllUsersFavorite(path: string) {
    this.userList.forEach((user) => {
      user.favoritePathList =
        user.favoritePathList?.filter((p) => p !== path) || []
    })
    this.sync()
  }
}
