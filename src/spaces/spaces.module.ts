import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { Space } from './entities/space.entity'
import { SpaceParticipantRole } from './entities/spaceParticipantRole.entity'
import { SpaceToUser } from './entities/spaceToUser.entity'
import { SpaceController } from './spaces.controller'
import { JwtAccessAuthGuard } from 'auth/jwt-access.guard'
import { AuthModule } from 'auth/auth.module'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { SpaceService } from './spaces.service'
import { SpaceAdminRole } from './entities/spaceAdminRole.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Space,
      SpaceParticipantRole,
      SpaceAdminRole,
      SpaceToUser,
    ]),
    AuthModule,
  ],
  providers: [SpaceService],
  controllers: [SpaceController],
  exports: [SpaceService],
})
export class SpaceModule {}
