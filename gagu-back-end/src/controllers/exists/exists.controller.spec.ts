import { Test, TestingModule } from '@nestjs/testing'
import { ExistsController } from './exists.controller'

describe('ExistController', () => {
  let controller: ExistsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExistsController],
    }).compile()

    controller = module.get<ExistsController>(ExistsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
