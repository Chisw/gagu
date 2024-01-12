import { Module } from '@nestjs/common'
import { TermuxController } from './termux.controller'
import { TermuxService } from './termux.service'

@Module({
  controllers: [TermuxController],
  providers: [TermuxService],
  exports: [TermuxService],
})
export class TermuxModule {}
