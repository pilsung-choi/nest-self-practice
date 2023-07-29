import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'

import { Space } from './entities/space.entity'
import { SpaceRole } from './entities/spaceRole.entity'
import { SpaceToUser } from './entities/spaceToUser.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Space, SpaceRole, SpaceToUser])],
  providers: [],
  controllers: [],
  exports: [],
})
export class SpaceModule {}
