import { Injectable } from '@nestjs/common'
import { User, IAuthRecord, IUser } from '../../types'
import {
  generateRandomToken,
  generateUserInfo,
  readAuthData,
  writeAuthData,
} from '../../utils'

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

  getUsername(token: User.Token) {
    const record = this.authRecordList.find((record) => record.token === token)
    return record?.username
  }

  create(user: IUser, ip: string, ua: string) {
    const token = generateRandomToken()
    const accessToken = generateRandomToken()
    const timestamp = Date.now()

    this.authRecordList.push({
      token,
      accessToken,
      username: user.username,
      loginAt: timestamp,
      pulsedAt: timestamp,
      ip,
      ua,
    })

    this.sync()

    return generateUserInfo(user, token, accessToken)
  }

  updatePulseTime(token: User.Token) {
    const record = this.authRecordList.find((record) => record.token === token)
    if (record) {
      record.pulsedAt = Date.now()
    }
    this.sync()
  }

  remove(token: User.Token) {
    this.authRecordList = this.authRecordList.filter(
      (record) => record.token !== token,
    )
    this.sync()
  }

  removeUserAllRecords(username: User.Username) {
    this.authRecordList
      .filter((r) => r.username === username)
      .map((r) => r.token)
      .forEach((token) => this.remove(token))
  }

  removeAll() {
    this.authRecordList = []
    this.sync()
  }
}
