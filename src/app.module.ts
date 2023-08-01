import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import Joi from 'joi'
import { LoggerMiddleware } from 'logger/logger.middleware'
import { User } from 'users/entites/user.entity'
import { UserModule } from 'users/users.module'
import { AuthModule } from 'auth/auth.module'
import { Space } from 'spaces/entities/space.entity'
import { SpaceParticipantRole } from 'spaces/entities/spaceParticipantRole.entity'
import { SpaceToUser } from 'spaces/entities/spaceToUser.entity'
import { SpaceModule } from 'spaces/spaces.module'
import { JwtModule } from '@nestjs/jwt'
import { CommonModule } from './common/common.module'
import { SpaceAdminRole } from 'spaces/entities/spaceAdminRole.entity'
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
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: process.env.DB_USER,
      password: 'cps159753',
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

  providers: [AppService],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    if (this.configService.get('NODE_ENV') === 'development') {
      consumer.apply(LoggerMiddleware).forRoutes('*')
    }
  }
}
