import { SetMetadata } from '@nestjs/common'
import { UserPermissionType } from 'src/types'

export const PERMISSION_DECORATOR_KEY = 'PERMISSION_DECORATOR_KEY'

export const Permission = (permission: UserPermissionType) =>
  SetMetadata(PERMISSION_DECORATOR_KEY, permission)
