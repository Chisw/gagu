import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { IS_API_PUBLIC_KEY } from '../decorators/public.decorator'
import { AuthService } from 'src/models/auth/auth.service'

@Injectable()
export class ApiGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get(IS_API_PUBLIC_KEY, context.getHandler())
    if (isPublic) {
      return true
    } else {
      const request = context.switchToHttp().getRequest<Request>()
      const authorization = request.header('Authorization') || ''
      const queryToken = (request.query.token || '') as string
      const token = authorization || queryToken
      const user = token ? this.authService.getLoginUsername(token) : undefined
      return !!user
    }
  }
}
