import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { initConfig } from './utils/fs'
import * as minimist from 'minimist'
import { GAGU_CURRENT_VERSION } from './utils'

const argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    port: 'p',
    version: 'v',
  },
  string: ['port'],
  boolean: ['help', 'version'],
  default: {
    port: 9293,
  },
})

async function bootstrap() {
  if (argv.help) {
    console.log('Usage:')
    console.log('  anywhere          // Start service')
    console.log('  anywhere -p 8888  // Start with customized port, `--port`')
    console.log('  anywhere -h       // Show help info, `--help`')
    console.log('  anywhere -v       // Show version, `--version`')
    process.exit(0)
  }

  if (argv.version) {
    console.log(GAGU_CURRENT_VERSION)
    process.exit(0)
  }

  initConfig()

  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.setGlobalPrefix('api')
  await app.listen(argv.port)
  console.log(`\n✨  Application is running on: http://127.0.0.1:${argv.port}`)
}

bootstrap()
