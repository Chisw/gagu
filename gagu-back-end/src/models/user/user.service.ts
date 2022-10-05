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
    return this.userList
  }

  findOne(username: User.Username) {
    return this.userList.find((user) => user.username === username)
  }

  create(user: IUser) {
    this.userList.push(user)
    this.sync()
  }

  update(userForm: IUserForm) {
    const index = this.userList.findIndex((u) => u.username === userForm.username)
    const user: IUser = this.userList[index]
    // Object.entries(userForm).forEach(([key, value]) => {
    //   if (value && (key in user)) {
    //     user[key] = value
    //   }
    // })
    this.userList.splice(index, 1, user)
    this.sync()
  }

  remove(username: User.Username) {
    this.userList = this.userList.filter((u) => u.username !== username)
    this.sync()
  }
}
