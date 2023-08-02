import { Module } from '@nestjs/common'
import { PostsController } from './posts.controller'
import { PostsService } from './posts.service'
import { Post } from './entities/posts.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MulterModule } from '@nestjs/platform-express'
import { SpaceToUser } from 'spaces/entities/spaceToUser.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Post, SpaceToUser])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
