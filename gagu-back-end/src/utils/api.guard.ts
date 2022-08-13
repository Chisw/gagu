import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { IS_API_PUBLIC_KEY } from './api.decorator'

@Injectable()
export class ApiGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublicApi = this.reflector.get(IS_API_PUBLIC_KEY, context.getHandler())
    if (isPublicApi) {
      return true
    } else {
      const request = context.switchToHttp().getRequest<Request>()
      const headerAuthorization = request.header('Authorization')
      console.log({ headerAuthorization })
      return !!headerAuthorization
    }
  }
}
