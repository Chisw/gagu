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
    const list: IUser[] = JSON.parse(JSON.stringify(this.userList))
    list.forEach((user) => (user.password = ''))
    return list
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
      assignedRootPathList,
      passwordLocked,
    } = userForm

    const user: IUser = {
      nickname,
      username,
      password,
      invalid: false,
      createdAt: Date.now(),
      expiredAt,
      permissions,
      assignedRootPathList,
      favoritePathList: [],
      passwordLocked,
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
      assignedRootPathList,
      passwordLocked,
    } = userForm

    const user = this.userList.find((u) => u.username === username)

    if (user) {
      user.nickname = nickname
      user.expiredAt = expiredAt
      user.permissions = permissions
      user.assignedRootPathList = assignedRootPathList
      user.passwordLocked = passwordLocked
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

  updatePassword(username: User.Username, password: User.Password) {
    const user = this.userList.find((user) => user.username === username)
    if (user) {
      user.password = password
      this.sync()
    }
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
      const pathList = Array.from(
        new Set([...(user.favoritePathList || []), path]),
      )
      user.favoritePathList = pathList
      this.sync()
      return pathList
    } else {
      return []
    }
  }

  removeFavorite(username: User.Username, path: string) {
    const user = this.userList.find((user) => user.username === username)
    if (user) {
      const pathList = user.favoritePathList?.filter((p) => p !== path) || []
      user.favoritePathList = pathList
      this.sync()
      return pathList
    } else {
      return []
    }
  }

  removeFavoriteOfAllUsers(path: string) {
    this.userList.forEach((user) => {
      user.favoritePathList =
        user.favoritePathList?.filter((p) => p !== path) || []
    })
    this.sync()
  }
}
