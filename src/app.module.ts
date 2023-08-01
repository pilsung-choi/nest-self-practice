import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_FILTER } from '@nestjs/core'
import Joi from 'joi'

import { UserModule } from 'users/users.module'
import { AuthModule } from 'auth/auth.module'
import { SpaceModule } from 'spaces/spaces.module'
import { CommonModule } from './common/common.module'
import { AppService } from './app.service'
import { LoggerMiddleware } from 'logger/logger.middleware'
import { AllExceptionsFilter } from 'filter/exception-filter'
import { SpaceParticipantRole } from 'spaces/entities/spaceParticipantRole.entity'
import { SpaceAdminRole } from 'spaces/entities/spaceAdminRole.entity'
import { SpaceToUser } from 'spaces/entities/spaceToUser.entity'
import { Space } from 'spaces/entities/space.entity'
import { User } from 'users/entites/user.entity'
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV
        ? `.env.${process.env.NODE_ENV}`
        : '.env',
      validationSchema: Joi.object<{ [K in keyof typeof process.env]: string }>(
        {
          NODE_ENV: Joi.string()
            .valid('development', 'production', 'test')
            .required(),
          PORT: Joi.number().default(3000).required(),
          DB_TYPE: Joi.string().required(),
          BASE_PATH: Joi.string().required(),
          DB_PORT: Joi.string().required(),
          DB_HOST: Joi.string().required(),
          DB_USER: Joi.string().required(),
          DB_PWD: Joi.string().required(),
          DB_NAME: Joi.string().required(),
        },
      ),
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PWD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      entities: [
        User,
        Space,
        SpaceParticipantRole,
        SpaceAdminRole,
        SpaceAdminRole,
        SpaceToUser,
      ],
    }),
    UserModule,
    AuthModule,
    SpaceModule,
    CommonModule,
  ],

  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    if (this.configService.get('NODE_ENV') === 'development') {
      consumer.apply(LoggerMiddleware).forRoutes('*')
    }
  }
}
