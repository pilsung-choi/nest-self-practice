import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { UserModule } from 'users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserService } from 'users/users.service'
import { User } from 'users/entites/user.entity'
import { JwtRefreshStrategy } from './jwt-refresh.strategy'
import { JwtAccessAuthGuard } from 'auth/jwt-access.guard'
import { JwtRefreshGuard } from './jwt-refresh.guard'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
          },
        }
      },
      inject: [ConfigService],
    }),
    forwardRef(() => UserModule), //In order to resolve circular dependencies between modules, use the same forwardRef()
  ],
  providers: [
    UserService,
    AuthService,
    ConfigService,
    JwtRefreshStrategy,
    JwtAccessAuthGuard,
    JwtRefreshGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
