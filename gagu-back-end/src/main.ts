import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { initConfigDir } from './utils'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  await app.listen(9293)
  initConfigDir()
}

bootstrap()
