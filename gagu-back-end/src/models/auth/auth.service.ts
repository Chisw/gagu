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

  update(token: User.Token) {
    const record = this.loginRecordList.find((record) => record.token === token)
    if (record) {
      record.timestamp = Date.now()
    }
    this.sync()
  }

  removeOne(token: User.Token) {
    this.loginRecordList = this.loginRecordList.filter(
      (record) => record.token !== token,
    )
    this.sync()
  }

  removeUserAll(username: User.Username) {
    this.loginRecordList
      .filter((r) => r.username === username)
      .map((r) => r.token)
      .forEach((token) => this.removeOne(token))
  }

  removeAll() {
    this.loginRecordList = []
    this.sync
  }
}
