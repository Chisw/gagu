import { Injectable } from '@nestjs/common'
import { User, IAuthRecord } from '../../types'
import { readAuthData, writeAuthData } from '../../utils'

@Injectable()
export class AuthService {
  private authRecordList: IAuthRecord[] = []

  constructor() {
    this.authRecordList = readAuthData()
  }

  sync() {
    writeAuthData(this.authRecordList)
  }

  findAll() {
    return this.authRecordList
  }

  findOneUsername(token: User.Token) {
    const username = this.authRecordList.find(
      (record) => record.token === token,
    )?.username
    return username
  }

  create(token: User.Token, username: User.Username) {
    this.authRecordList.push({
      token,
      username,
      timestamp: Date.now(),
    })
    this.sync()
  }

  update(token: User.Token) {
    const record = this.authRecordList.find((record) => record.token === token)
    if (record) {
      record.timestamp = Date.now()
    }
    this.sync()
  }

  remove(token: User.Token) {
    this.authRecordList = this.authRecordList.filter(
      (record) => record.token !== token,
    )
    this.sync()
  }

  removeUser(username: User.Username) {
    this.authRecordList
      .filter((r) => r.username === username)
      .map((r) => r.token)
      .forEach((token) => this.remove(token))
  }

  removeAll() {
    this.authRecordList = []
    this.sync
  }
}
