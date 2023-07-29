import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'users/entites/user.entity'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UserService } from 'users/users.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UserModule } from 'users/users.module'
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
        console.log(configService.get<string>('JWT_ACCESS_SECRET'))
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION_TIME'),
          },
        }
      },
      inject: [ConfigService],
    }),
    forwardRef(() => UserModule),
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
