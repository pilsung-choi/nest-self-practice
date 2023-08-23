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

    const userInfo = await this.checkOwnerOrAdmin(id, spaceId)

    if (type === 'notification') {
      if (userInfo.owner || userInfo.role === 'admin') {
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
      post.writer = `${lastName}${firstName}`
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
    const userInfo = await this.checkOwnerOrAdmin(id, spaceId)

    if (!(userInfo.role === 'participant')) {
      throw new HttpException(
        '참여자만 익명으로 post를 작성할 수 있습니다.',
        HttpStatus.BAD_REQUEST,
      )
    }
    const post = this.postRepo.create()
    post.file = filePath
    post.content = content
    post.type = type
    post.writer = 'anonymouse'
    post.WriterId = id
    post.SpaceId = spaceId
    await this.postRepo.save(post)
  }
  // 수정 필요
  async getPosts(userId: number, spaceId: number) {
    const userInfo = await this.checkOwnerOrAdmin(userId, spaceId)

    const selectWriterId =
      userInfo?.owner || userInfo?.role === 'admin' ? true : false
    console.log(selectWriterId)
    const postsQuery = this.postRepo
      .createQueryBuilder('post')
      .where('post.SpaceId = :spaceId', { spaceId })

    if (selectWriterId) {
      return await postsQuery.addSelect('post.WriterId').getMany()
    }

    return await postsQuery.getMany()
  }

  async deletePost(userId: number, spaceId: number, postId: number) {
    //관리자 작성자만 삭제
    const ownerOrAdmin = this.checkOwnerOrAdmin(userId, spaceId)
    // await this.postRepo.createQueryBuilder('post')
  }

  async checkOwnerOrAdmin(userId: number, spaceId: number) {
    return await this.spaceToUserRepo
      .createQueryBuilder('spaceToUser')
      .where('spaceToUser.UserId = :UserId', { UserId: userId })
      .andWhere('spaceToUser.SpaceId = :SpaceId', { SpaceId: spaceId })
      .getOne()
  }
}
