import { Test, TestingModule } from '@nestjs/testing'
import { RenameController } from './rename.controller'

describe('RenameController', () => {
  let controller: RenameController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RenameController],
    }).compile()

    controller = module.get<RenameController>(RenameController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
