import { SetMetadata } from '@nestjs/common'
import { UserPermissionType } from '../../types'

export const PERMISSION_DECORATOR_KEY = 'PERMISSION_DECORATOR_KEY'

export const Permission = (
  permissions: UserPermissionType | UserPermissionType[],
) => SetMetadata(PERMISSION_DECORATOR_KEY, permissions)
