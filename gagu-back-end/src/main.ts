import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { initConfigDir } from './utils'
import * as minimist from 'minimist'

const argv = minimist(process.argv.slice(2), {
  alias: {
    'silent': 's',
    'port': 'p',
    'dir': 'd',
    'proxy': 'x',
    'log': 'l',
    'fallback': 'f',
  },
  string: ['port', 'fallback'],
  boolean: ['silent', 'log'],
  default: {
    'port': 9293,
    'dir': process.cwd(),
  }
})

console.log({ argv })

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.setGlobalPrefix('api')
  await app.listen(argv.port)
  console.log(`\n✨  Application is running on: http://127.0.0.1:${argv.port}`);
  initConfigDir()
}

bootstrap()
