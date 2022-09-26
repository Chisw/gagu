import { SetMetadata } from '@nestjs/common'

export const IS_API_PUBLIC_KEY = 'IS_API_PUBLIC_KEY'

export const Public = () => SetMetadata(IS_API_PUBLIC_KEY, true)
