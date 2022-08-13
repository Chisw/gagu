import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { initConfigDir } from './utils'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.setGlobalPrefix('api')
  await app.listen(9293)
  console.log(`\n✨  Application is running on: ${await app.getUrl()}`);
  initConfigDir()
}

bootstrap()
