import { SetMetadata } from '@nestjs/common'

export const PATH_VALIDATION_DECORATOR_KEY = 'PATH_VALIDATION_DECORATOR_KEY'

export interface IPathValidation {
  queryFields?: string[]
  bodyFields?: string[]
  bodyEntryListField?: string
}

export const PathValidation = (items: IPathValidation) =>
  SetMetadata(PATH_VALIDATION_DECORATOR_KEY, items)
