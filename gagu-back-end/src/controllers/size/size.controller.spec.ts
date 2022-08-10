import { Test, TestingModule } from '@nestjs/testing'
import { SizeController } from './size.controller'

describe('SizeController', () => {
  let controller: SizeController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SizeController],
    }).compile()

    controller = module.get<SizeController>(SizeController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
