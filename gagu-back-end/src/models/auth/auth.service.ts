import { Injectable } from '@nestjs/common'
import { User, ILoginRecord } from 'src/types'
import { readLoginData, writeLoginData } from 'src/utils'

@Injectable()
export class AuthService {
  private loginRecordList: ILoginRecord[] = []

  constructor() {
    this.loginRecordList = readLoginData()
  }

  sync() {
    writeLoginData(this.loginRecordList)
  }

  findAll() {
    return this.loginRecordList
  }

  findOneUsername(token: User.Token) {
    const username = this.loginRecordList.find(
      (record) => record.token === token,
    )?.username
    return username
  }

  create(token: User.Token, username: User.Username) {
    this.loginRecordList.push({
      token,
      username,
      timestamp: Date.now(),
    })
    this.sync()
  }

  remove(token: User.Token) {
    this.loginRecordList = this.loginRecordList.filter(
      (record) => record.token !== token,
    )
    this.sync()
  }

  removeAll(username: User.Username) {
    this.loginRecordList
      .filter((r) => r.username === username)
      .map((r) => r.token)
      .forEach((token) => this.remove(token))
  }
}
