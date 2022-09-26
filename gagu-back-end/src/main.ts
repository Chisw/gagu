import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { initConfig } from './utils'
import { GAGU_VERSION, openInBrowser } from './utils'
import * as minimist from 'minimist'

const argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    port: 'p',
    open: 'o',
    version: 'v',
  },
  string: ['port'],
  boolean: ['help', 'open', 'version'],
  default: {
    port: 9293,
  },
})

async function bootstrap() {
  if (argv.help) {
    console.log('Usage:')
    console.log('  gagu          // Start service')
    console.log('  gagu -p 8888  // Start with customized port, `--port`')
    console.log('  gagu -o       // Start and open in browser, `--open`')
    console.log('  gagu -h       // Show help info, `--help`')
    console.log('  gagu -v       // Show version, `--version`')
    process.exit(0)
  }

  if (argv.version) {
    console.log(GAGU_VERSION)
    process.exit(0)
  }

  initConfig()

  const app = await NestFactory.create(AppModule)

  app.enableCors()
  app.setGlobalPrefix('api')

  await app.listen(argv.port)

  const url = `http://127.0.0.1:${argv.port}`

  console.log(`\n✨  GAGU service is running on: ${url}`)

  argv.open && openInBrowser(`${url}/login`)
}

bootstrap()
