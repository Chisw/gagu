import { Test, TestingModule } from '@nestjs/testing'
import { DeleteController } from './delete.controller'

describe('DeleteController', () => {
  let controller: DeleteController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteController],
    }).compile()

    controller = module.get<DeleteController>(DeleteController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
