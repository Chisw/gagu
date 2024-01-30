import { IUser, UserPermission } from '../types'
import { GAGU_PATH, ServerOS } from './constant.util'
import { writeAuthData, writeUsersData } from './user.util'
import { completeNestedPath, getExists } from './fs.util'
import { writeTunnelData } from './tunnel.util'
import { writeSettingsData } from './setting.util'
import * as md5 from 'md5'
import { exec } from 'child_process'
import { readFileSync } from 'fs'
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface'

export const initialize = async (security: boolean) => {
  completeNestedPath(`${GAGU_PATH.ROOT}/data/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/log/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/avatar/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/image/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/public/lib/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/secrets/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/thumbnail/_`)
  completeNestedPath(`${GAGU_PATH.ROOT}/users/_`)

  if (!getExists(GAGU_PATH.DATA_USERS)) {
    const administrator: IUser = {
      nickname: 'Admin',
      username: 'gagu',
      password: md5('9293'),
      invalid: false,
      createdAt: Date.now(),
      expiredAt: undefined,
      permissions: [
        UserPermission.administer,
        UserPermission.read,
        UserPermission.write,
        UserPermission.delete,
      ],
      assignedRootPathList: [],
      favoritePathList: [],
    }
    writeUsersData([administrator])
  }

  if (!getExists(GAGU_PATH.DATA_AUTH)) {
    writeAuthData([])
  }

  if (!getExists(GAGU_PATH.DATA_TUNNELS)) {
    writeTunnelData([])
  }

  if (!getExists(GAGU_PATH.DATA_SETTINGS)) {
    writeSettingsData({})
  }

  const libMap: { [LIB_KEY: string]: boolean } = {
    ffmpeg: false,
    gm: false,
    zip: false,
    unzip: false,
    curl: false,
  }

  const cmd = ServerOS.isWindows ? 'where' : 'type'

  await Promise.all(
    Object.keys(libMap).map((libKey) => {
      return new Promise((resolve) => {
        exec(`${cmd} ${libKey}`, (err, out) => {
          if (ServerOS.isWindows) {
            libMap[libKey] = out === '' ? false : true
          } else {
            libMap[libKey] = !out.includes('not found')
          }
          resolve(true)
        })
      })
    }),
  )

  ServerOS.supportThumbnail = libMap.ffmpeg && libMap.gm
  ServerOS.supportCompression = libMap.zip && libMap.unzip
  ServerOS.supportCurl = libMap.curl

  if (security) {
    const keyPath = `${GAGU_PATH.SECRETS}/private-key.pem`
    const certPath = `${GAGU_PATH.SECRETS}/public-certificate.pem`
    const keyExisted = getExists(keyPath)
    const certExisted = getExists(certPath)

    if (keyExisted && certExisted) {
      const options: HttpsOptions = {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath),
      }
      return options
    } else {
      console.log('\n⚠️  Check whether HTTPS PEM files exist:\n')
      console.log(`   - KEY:  ${keyPath}`)
      console.log(`   - CERT: ${certPath}\n`)
      process.exit(0)
    }
  } else {
    return undefined
  }
}
