import { Test, TestingModule } from '@nestjs/testing'
import { TextContentController } from './text-content.controller'

describe('TextContentController', () => {
  let controller: TextContentController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextContentController],
    }).compile()

    controller = module.get<TextContentController>(TextContentController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
