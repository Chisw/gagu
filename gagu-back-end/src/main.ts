import { NestFactory } from '@nestjs/core'
import * as express from 'express'
import { AppModule } from './app.module'
import { initConfigDir } from './utils'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.use('/', express.static('./public'))
  await app.listen(9293)
  initConfigDir()
}

bootstrap()
