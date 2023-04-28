import { HOST, readSettingsData } from './utils'
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

  const app = await NestFactory.create(AppModule)

  app.enableCors()
  app.setGlobalPrefix('api')

  await app.listen(port, Host)

  console.log(`\n✨  GAGU service is running on: ${url}\n`)

  argv.open && openInBrowser(`${url}/login`)
}

bootstrap()
