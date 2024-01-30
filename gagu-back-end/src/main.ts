import { HOST, IS_DEV, LOGO_TEXT, readSettingsData } from './utils'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  HELP_INFO,
  initialize,
  GAGU_VERSION,
  openInBrowser,
  GAGU_PATH,
  removeEntry,
} from './utils'
import * as minimist from 'minimist'
import * as chalk from 'chalk'
import { json } from 'express'

const argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    Host: 'H',
    open: 'o',
    port: 'p',
    security: 's',
    version: 'v',
  },
  string: ['Host', 'port'],
  boolean: ['help', 'open', 'reset', 'reset-all', 'security', 'version'],
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
    await removeEntry(GAGU_PATH.DATA)
    console.log(
      '\n🔔 GAGU_PATH.DATA',
      GAGU_PATH.DATA,
      'removed successfully.\n',
    )
    process.exit(0)
  }

  if (argv['reset-all']) {
    await removeEntry(GAGU_PATH.ROOT)
    console.log(
      '\n🔔 GAGU_PATH.ROOT',
      GAGU_PATH.ROOT,
      'removed successfully.\n',
    )
    process.exit(0)
  }

  if (argv.version) {
    console.log(GAGU_VERSION)
    process.exit(0)
  }

  const httpsOptions = await initialize(argv.security)

  const settings = readSettingsData()
  const protocol = httpsOptions ? 'https' : 'http'
  const host = argv.Host || settings.host || undefined
  const port = argv.port || settings.port || 9293
  const url = `${protocol}://${host || HOST}:${port}`

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    logger: IS_DEV
      ? ['log', 'error', 'warn', 'debug', 'verbose']
      : ['error', 'warn'],
  })

  app.enableCors()
  app.use(json({ limit: '5mb' }))
  app.setGlobalPrefix('api')

  await app.listen(port, host)

  console.log(chalk.green.bold(LOGO_TEXT))
  console.log(`    GAGU v${GAGU_VERSION} service successfully started.\n`)
  console.log(`    PID: ${process.pid}`)
  console.log(`    URL: ${chalk.underline.bold(url)}\n\n`)

  argv.open && openInBrowser(`${url}/login`)
}

bootstrap()
