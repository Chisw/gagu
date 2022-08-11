import { Test, TestingModule } from '@nestjs/testing'
import { AddDirectoryController } from './add-directory.controller'

describe('AddDirectoryController', () => {
  let controller: AddDirectoryController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddDirectoryController],
    }).compile()

    controller = module.get<AddDirectoryController>(AddDirectoryController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
