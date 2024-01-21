import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { AuthService } from '../../modules/auth/auth.service'
import { UserService } from '../../modules/user/user.service'
import { IEntry, IUser, UserPermission, UserPermissionType } from '../../types'
import { GAGU_PATH, getEntryPath, getRequestToken } from '../../utils'
import {
  IPathValidation,
  PUBLIC_DECORATOR_KEY,
  PERMISSION_DECORATOR_KEY,
  PATH_VALIDATION_DECORATOR_KEY,
} from '../decorators'

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

    if (isPublic) {
      return true
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: IUser | undefined }>()

    const token = getRequestToken(request)
    const username = token ? this.authService.getUsername(token) : undefined
    const isLoggedIn = !!username

    if (!isLoggedIn) {
      throw new UnauthorizedException()
    }

    const user = this.userService.findOne(username)

    if (!user) {
      return false
    }

    request.user = user

    const requiredPermissions:
      | UserPermissionType
      | UserPermissionType[]
      | undefined = this.reflector.get(PERMISSION_DECORATOR_KEY, handler)

    const pathValidation: IPathValidation | undefined = this.reflector.get(
      PATH_VALIDATION_DECORATOR_KEY,
      handler,
    )

    let isPermissionPassed = true
    let isPathValidationPassed = true

    if (requiredPermissions) {
      if (Array.isArray(requiredPermissions)) {
        isPermissionPassed = requiredPermissions.every((permission) => {
          return user?.permissions.includes(permission)
        })
      } else {
        isPermissionPassed = !!user?.permissions.includes(requiredPermissions)
      }
    }

    if (pathValidation) {
      const valueList: any[] = []
      const { queryFields, bodyFields, bodyEntryListField } = pathValidation
      const { assignedRootPathList = [], permissions } = user
      const isAdmin = permissions.includes(UserPermission.administer)
      const userPath = `${GAGU_PATH.USERS}/${username}`
      const userPathList = [userPath, ...assignedRootPathList]

      if (queryFields?.length) {
        queryFields.forEach((field) => {
          valueList.push(request.query[field])
        })
      }

      if (bodyFields?.length) {
        bodyFields.forEach((field) => {
          valueList.push(request.body[field])
        })
      }

      if (bodyEntryListField) {
        const entryList = request.body[bodyEntryListField] as IEntry[]
        entryList.forEach((entry) => {
          valueList.push(getEntryPath(entry))
        })
      }

      const validatingPathList: string[] = valueList.filter((val) => {
        return typeof val === 'string' && !!val
      })

      validatingPathList.forEach((validatingPath) => {
        const isRelativePath = validatingPath.includes('/../')

        const isInRoot =
          validatingPath.startsWith(GAGU_PATH.ROOT) &&
          !validatingPath.startsWith(userPath)

        /**
         *  If user is not an administrator,
         *  as long as there is one match,
         *  it is not out of assigned scope.
         *  */
        const isOutAssigned = isAdmin
          ? false
          : !userPathList.some((path) => validatingPath.startsWith(path))

        // console.log({ userPathList, validatingPathList, isRelativePath, isInRoot, isOutAssigned })

        if (isRelativePath || isInRoot || isOutAssigned) {
          isPathValidationPassed = false
        }
      })
    }

    return isPermissionPassed && isPathValidationPassed
  }
}
