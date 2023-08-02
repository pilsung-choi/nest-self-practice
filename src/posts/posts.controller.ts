import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
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

  //   1. 공간 내에서는 게시글 목록을 조회할 수 있습니다.
  //   2. 공간 내에서는 자유롭게 게시글을 등록할 수 있으며, 각 게시글에는 파일이나 이미지를 첨부할 수 있습니다.
  //   3. 게시글의 종류에는 "공지"와 "질문" 두 가지가 있습니다.
  //   4. 관리자는 "공지"와 “질문”을 모두 작성할 수 있고, 참여자는 "질문"만 작성할 수 있습니다.
  //   5. “질문" 게시글은 익명 상태로 작성하는 것이 가능합니다.
  //       1. 단, 익명 상태로 게시글을 작성할 수 있는 것은 “참여자"뿐입니다.
  //       2. 관리자의 경우, “익명” 게시글의 글쓴이를 확인할 수 있습니다.
  //       3. 따라서 참여자에게는 게시글 목록 데이터에서 글쓴이의 정보가 존재하지 않아야 합니다. (본인 제외)
  //   6. 게시글은 "관리자" 또는 "작성자"만 삭제할 수 있습니다.

  //  2. 공간 내에서는 자유롭게 게시글을 등록할 수 있으며, 각 게시글에는 파일이나 이미지를 첨부할 수 있습니다.
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

  // 5. “질문" 게시글은 익명 상태로 작성하는 것이 가능합니다.
  //     1. 단, 익명 상태로 게시글을 작성할 수 있는 것은 “참여자"뿐입니다.
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
}
