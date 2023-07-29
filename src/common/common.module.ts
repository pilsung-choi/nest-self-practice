import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { CommonInterceptor } from './common.interceptor'

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CommonInterceptor,
    },
  ],
})
export class CommonModule {}
