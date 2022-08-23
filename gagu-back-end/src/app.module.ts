import {
  Injectable,
  Module,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { APP_GUARD } from '@nestjs/core'
import { AuthController } from './controllers/auth.controller'
import { FsController } from './controllers/fs.controller'
import { IS_DEV, IS_API_PUBLIC_KEY } from './utils'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Request } from 'express'

@Injectable()
export class AppService {}

@Injectable()
export class ApiGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublicApi = this.reflector.get(
      IS_API_PUBLIC_KEY,
      context.getHandler(),
    )
    if (isPublicApi) {
      return true
    } else {
      const request = context.switchToHttp().getRequest<Request>()
      const authorization = request.header('Authorization')
      console.log({ authorization })
      return !!authorization
    }
  }
}

@Module({
  providers: [{ provide: APP_GUARD, useClass: ApiGuard }],
})
class CommonModule {}

const rootPath = IS_DEV
  ? join(__dirname, '..', '..', 'gagu-front-end', 'build')
  : join(__dirname, 'public')

@Module({
  imports: [
    CommonModule,
    ServeStaticModule.forRoot(
      { rootPath, serveRoot: '/' },
      { rootPath, serveRoot: '/mobile' },
      { rootPath, serveRoot: '/login' },
      { rootPath, serveRoot: '/lock' },
    ),
  ],
  controllers: [AuthController, FsController],
  providers: [AppService],
})
export class AppModule {}
