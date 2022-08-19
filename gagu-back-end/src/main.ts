import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { initConfig } from './utils/fs'
import * as minimist from 'minimist'
import { GAGU_CURRENT_VERSION } from './utils'

const argv = minimist(process.argv.slice(2), {
  alias: {
    port: 'p',
    log: 'l',
    version: 'v',
  },
  string: ['port'],
  boolean: ['log', 'version'],
  default: {
    port: 9293,
  },
})

async function bootstrap() {
  if (argv.version) {
    console.log(GAGU_CURRENT_VERSION)
    return null
  }
  initConfig()
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.setGlobalPrefix('api')
  await app.listen(argv.port)
  console.log(`\n✨  Application is running on: http://127.0.0.1:${argv.port}`)
}

bootstrap()
