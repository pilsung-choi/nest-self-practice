import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { Space } from './entities/space.entity'
import { SpaceRole } from './entities/spaceRole.entity'
import { SpaceToUser } from './entities/spaceToUser.entity'
import { SpaceController } from './spaces.controller'
import { JwtAccessAuthGuard } from 'auth/jwt-access.guard'
import { AuthModule } from 'auth/auth.module'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { SpaceService } from './spaces.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Space, SpaceRole, SpaceToUser]),
    AuthModule,
  ],
  providers: [SpaceService],
  controllers: [SpaceController],
  exports: [],
})
export class SpaceModule {}
