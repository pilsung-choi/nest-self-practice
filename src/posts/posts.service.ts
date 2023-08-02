import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { CreatePostDto } from './dtos/post.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { SpaceToUser } from 'spaces/entities/spaceToUser.entity'
import { Repository } from 'typeorm'
import { Post } from './entities/posts.entity'
import { User } from 'users/entites/user.entity'

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(SpaceToUser)
    private spaceToUserRepo: Repository<SpaceToUser>,
    @InjectRepository(Post)
    private postRepo: Repository<Post>,
  ) {}

  async createPost(
    user: User,
    postInfo: CreatePostDto,
    filePath?: string | undefined,
  ) {
    const { id, firstName, lastName } = user
    const { content, type, spaceId } = postInfo
    // 1. type이 공지면 spaceToUser의 role가 관리자인지 확인
    if (type === 'notification') {
      const userInfo = await this.spaceToUserRepo
        .createQueryBuilder('spaceToUser')
        .where('spaceToUser.UserId = :userId', { userId: id })
        .andWhere('spaceToUser.SpaceId = :spaceId', { spaceId })
        .getOne()

      if (userInfo.owner === true || userInfo.role === 'admin') {
        const adminPost = this.postRepo.create()
        adminPost.file = filePath
        adminPost.content = content
        adminPost.type = type
        adminPost.writer = `${lastName}${firstName}`
        adminPost.WriterId = id
        adminPost.SpaceId = spaceId
        await this.postRepo.save(adminPost)
      } else {
        throw new HttpException(
          '해당 space의 소유자 혹은 관리자만 공지를 올릴 수 있습니다.',
          HttpStatus.FORBIDDEN,
        )
      }
    } else {
      const post = this.postRepo.create()
      post.file = filePath
      post.content = content
      post.type = type
      post.writer = lastName + firstName
      post.WriterId = id
      post.SpaceId = spaceId
      await this.postRepo.save(post)
    }
  }

  async createAnonymousePost(
    user: User,
    postInfo: CreatePostDto,
    filePath?: string | undefined,
  ) {
    const { id } = user
    const { content, type, spaceId } = postInfo
    const userInfo = await this.spaceToUserRepo
      .createQueryBuilder('spaceToUser')
      .where('spaceToUser.UserId = :userId', { userId: id })
      .andWhere('spaceToUser.SpaceId = :spaceId', { spaceId })
      .getOne()

    if (!(userInfo.role === 'participant')) {
      throw new HttpException(
        '참여자만 익명으로 post를 작성할 수 있습니다.',
        HttpStatus.FORBIDDEN,
      )
    }
    const post = this.postRepo.create()
    post.file = filePath
    post.content = content
    post.type = type
    post.writer = ''
    post.WriterId = id
    post.SpaceId = spaceId
    await this.postRepo.save(post)
  }
}
