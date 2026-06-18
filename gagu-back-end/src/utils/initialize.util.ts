import { IUser, UserPermission } from '@shared'
import { GAGU_PATH, ServerOS } from './constant.util'
import { writeAuthData, writeUsersData } from './user.util'
import { makeNestedDirectory, exists } from './fs.util'
import { writeTunnelData } from './tunnel.util'
import { writeSettingsData } from './setting.util'
import { exec } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface'
import { sha256 } from './common.util'

export const initialize = async (withSecurity: boolean) => {
  makeNestedDirectory(
    `${GAGU_PATH.ROOT}/data`,
    `${GAGU_PATH.ROOT}/log`,
    `${GAGU_PATH.ROOT}/public`,
    `${GAGU_PATH.ROOT}/public/avatar`,
    `${GAGU_PATH.ROOT}/public/image`,
    `${GAGU_PATH.ROOT}/public/lib`,
    `${GAGU_PATH.ROOT}/secrets`,
    `${GAGU_PATH.ROOT}/thumbnail`,
    `${GAGU_PATH.ROOT}/users`,
  )

  if (!exists(GAGU_PATH.DATA_USERS)) {
    const administrator: IUser = {
      nickname: 'Admin',
      username: 'gagu',
      password: sha256('9293'),
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

  if (!exists(GAGU_PATH.DATA_AUTH)) {
    writeAuthData([])
  }

  if (!exists(GAGU_PATH.DATA_TUNNELS)) {
    writeTunnelData([])
  }

  if (!exists(GAGU_PATH.DATA_SETTINGS)) {
    writeSettingsData({})
  }

  const libMap: { [LIB_KEY: string]: boolean } = {
    curl: false,
    ffmpeg: false,
    gm: false,
    gs: false,
    unzip: false,
    zip: false,
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

  if (withSecurity) {
    const keyPath = `${GAGU_PATH.SECRETS}/private-key.pem`
    const certPath = `${GAGU_PATH.SECRETS}/public-certificate.pem`
    const keyExisted = exists(keyPath)
    const certExisted = exists(certPath)

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
