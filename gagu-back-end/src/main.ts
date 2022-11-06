import { readSettingsData } from './utils'
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
    open: 'o',
    port: 'p',
    version: 'v',
  },
  string: ['port'],
  boolean: ['help', 'open', 'reset', 'version'],
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
  const port = argv.port || settings.port || 9293

  const app = await NestFactory.create(AppModule)

  app.enableCors()
  app.setGlobalPrefix('api')

  await app.listen(port)

  const url = `http://127.0.0.1:${port}`

  console.log(`\n✨  GAGU service is running on: ${url}\n`)

  argv.open && openInBrowser(`${url}/login`)
}

bootstrap()
