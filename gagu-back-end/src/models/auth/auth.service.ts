import { Injectable } from '@nestjs/common'
import { User, ILoginMap } from 'src/types'
import { readLoginData, writeLoginData } from 'src/utils'

@Injectable()
export class AuthService {
  private loginMap: ILoginMap = {}

  constructor() {
    this.loginMap = readLoginData()
  }

  sync() {
    writeLoginData(this.loginMap)
  }

  findAll() {
    return this.loginMap
  }

  findOneUsername(token: User.Token) {
    const username = this.loginMap[token] as User.Username | undefined
    return username
  }

  create(token: User.Token, username: User.Username) {
    this.loginMap[token] = username
    this.sync()
  }

  remove(token: User.Token) {
    const username = this.findOneUsername(token)
    const entries = Object.entries(this.loginMap).filter(
      ([, userName]) => userName !== username,
    )
    this.loginMap = Object.fromEntries(entries)
    this.sync()
  }
}
