import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ApiGuard } from './utils/api.guard'

@Module({
  providers: [{ provide: APP_GUARD, useClass: ApiGuard }]
})
export class CommonModule {}
