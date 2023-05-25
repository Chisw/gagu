import { HOST, IS_DEV, LOGO_TEXT, readSettingsData } from './utils'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  HELP_INFO,
  initialize,
  GAGU_VERSION,
  openInBrowser,
  GAGU_PATH,
  deleteEntry,
} from './utils'
import * as minimist from 'minimist'
import * as chalk from 'chalk'
import * as cookieParser from 'cookie-parser'
import { json } from 'express'

const argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    Host: 'H',
    open: 'o',
    port: 'p',
    version: 'v',
  },
  string: ['Host', 'port'],
  boolean: ['help', 'open', 'reset', 'reset-all', 'version'],
  unknown() {
    console.log(HELP_INFO)
    process.exit(0)
  },
})

async function bootstrap() {
  if (argv.help) {
    console.log(HELP_INFO)
    process.exit(0)
  }

  if (argv.reset) {
    deleteEntry(GAGU_PATH.DATA)
    console.log('\n🔔 GAGU_DATA', GAGU_PATH.DATA, 'removed successfully.\n')
    process.exit(0)
  }

  if (argv['reset-all']) {
    deleteEntry(GAGU_PATH.ROOT)
    console.log('\n🔔 GAGU_ROOT', GAGU_PATH.ROOT, 'removed successfully.\n')
    process.exit(0)
  }

  if (argv.version) {
    console.log(GAGU_VERSION)
    process.exit(0)
  }

  initialize()

  const settings = readSettingsData()
  const Host = argv.Host || undefined
  const port = argv.port || settings.port || 9293
  const url = `http://${Host || HOST}:${port}`

  const app = await NestFactory.create(AppModule, {
    logger: IS_DEV
      ? ['log', 'error', 'warn', 'debug', 'verbose']
      : ['error', 'warn'],
  })

  app.enableCors()
  app.use(cookieParser())
  app.use(json({ limit: '5mb' }))
  app.setGlobalPrefix('api')

  await app.listen(port, Host)

  console.log(chalk.green.bold(LOGO_TEXT))
  console.log(`    GAGU (v${GAGU_VERSION}) service successfully started.\n`)
  console.log(`    PID: ${process.pid}`)
  console.log(`    URL: ${chalk.underline.bold(url)}\n\n`)

  argv.open && openInBrowser(`${url}/login`)
}

bootstrap()
