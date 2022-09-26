import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { IS_API_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class ApiGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.get(IS_API_PUBLIC_KEY, context.getHandler())
    const request = context.switchToHttp().getRequest<Request>()
    const authorization = request.header('Authorization')
    const token = request.query.token
    const isAuthTrue = authorization && authorization.length === 32
    const isTokenTrue = token && token.length === 8
    const isVerified = isAuthTrue || isTokenTrue
    return isPublic || isVerified
  }
}
