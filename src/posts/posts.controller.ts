import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'

import { PostsService } from './posts.service'
import { JwtAccessAuthGuard } from 'auth/jwt-access.guard'
import { GetUser } from 'users/decorator/users.decorator'
import { User } from 'users/entites/user.entity'
import { CreatePostDto } from './dtos/post.dto'

try {
  fs.readdirSync('uploads')
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.')
  fs.mkdirSync('uploads')
}
@UseGuards(JwtAccessAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postService: PostsService) {}

  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination(req, file, cb) {
          cb(null, 'uploads/')
        },
        filename(req, file, cb) {
          const ext = path.extname(file.originalname)
          cb(null, path.basename(file.originalname, ext) + Date.now() + ext)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @Post('')
  async craetPost(
    @GetUser() user: User,
    @Body() postInfo: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const path = file?.path
    return this.postService.createPost(user, postInfo, path)
  }

  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination(req, file, cb) {
          cb(null, 'uploads/')
        },
        filename(req, file, cb) {
          const ext = path.extname(file.originalname)
          cb(null, path.basename(file.originalname, ext) + Date.now() + ext)
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @Post('/anonymouse')
  async craetAnonymousePost(
    @GetUser() user: User,
    @Body() postInfo: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const path = file?.path
    return this.postService.createAnonymousePost(user, postInfo, path)
  }

  @Get('/:spaceId')
  async getPosts(@GetUser() user: User, @Param('spaceId') spaceId: number) {
    console.log(typeof spaceId)
    const { id } = user
    return this.postService.getPosts(id, spaceId)
  }

  @Delete('/:spaceId/:postId')
  async deletePost(
    @GetUser() user: User,
    @Param('spaceId') spaceId: number,
    @Param('postId') postId: number,
  ) {
    const { id } = user
    return this.postService.deletePost(id, spaceId, postId)
  }
}
