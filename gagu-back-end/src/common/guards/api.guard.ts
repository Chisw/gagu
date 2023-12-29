import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { PUBLIC_DECORATOR_KEY } from '../decorators/public.decorator'
import { AuthService } from '../../modules/auth/auth.service'
import { PERMISSION_DECORATOR_KEY } from '../decorators/permission.decorator'
import { UserService } from '../../modules/user/user.service'
import { IUser, UserPermissionType } from '../../types'
import { getRequestToken } from '../../utils'

@Injectable()
export class ApiGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const handler = context.getHandler()
    const isPublic = this.reflector.get(PUBLIC_DECORATOR_KEY, handler)
    const requiredPermissions:
      | UserPermissionType
      | UserPermissionType[]
      | undefined = this.reflector.get(PERMISSION_DECORATOR_KEY, handler)

    if (isPublic) {
      return true
    } else {
      const request = context
        .switchToHttp()
        .getRequest<Request & { user: IUser | undefined }>()

      const token = getRequestToken(request)
      const username = token ? this.authService.getUsername(token) : undefined
      const isLoggedIn = !!username

      if (isLoggedIn) {
        if (requiredPermissions) {
          const user = this.userService.findOne(username)
          request.user = user
          if (Array.isArray(requiredPermissions)) {
            return requiredPermissions.every((permission) => {
              return user?.permissions.includes(permission)
            })
          } else {
            return !!user?.permissions.includes(requiredPermissions)
          }
        } else {
          return true
        }
      } else {
        throw new UnauthorizedException()
      }
    }
  }
}
