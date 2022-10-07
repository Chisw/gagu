import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { PUBLIC_DECORATOR_KEY } from '../decorators/public.decorator'
import { AuthService } from 'src/models/auth/auth.service'
import { PERMISSION_DECORATOR_KEY } from '../decorators/permission.decorator'
import { UserService } from 'src/models/user/user.service'
import { UserPermissionType } from 'src/types'
import { getReqToken } from 'src/utils'

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
    const requiredPermission: UserPermissionType | undefined = this.reflector.get(PERMISSION_DECORATOR_KEY, handler)
    if (isPublic) {
      return true
    } else {
      const req = context.switchToHttp().getRequest<Request>()
      const token = getReqToken(req)
      const username = token ? this.authService.findOneUsername(token) : undefined
      const isLoggedIn = !!username

      if (isLoggedIn) {
        if (requiredPermission) {
          const user = this.userService.findOne(username)
          return !!user?.permissionList.includes(requiredPermission)
        } else {
          return true
        }
      } else {
        throw new UnauthorizedException()
      }
    }
  }
}
