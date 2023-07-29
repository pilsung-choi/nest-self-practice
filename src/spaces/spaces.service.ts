import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Space } from './entities/space.entity'
import { Repository, getConnection } from 'typeorm'
import { CreateSpaceDto } from './dtos/create-space.dto'
import { CheckCodeFromSpaceDto } from './dtos/check-code.dto'
import { SpaceToUser } from './entities/spaceToUser.entity'
import { ResponseType } from 'common/response-type'
import { nanoid } from 'nanoid'

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private spaceRepo: Repository<Space>,
    @InjectRepository(SpaceToUser)
    private spaceToUserRepo: Repository<SpaceToUser>,
  ) {}

  async createSpace(createSpaceDto: CreateSpaceDto, id: number): Promise<any> {
    const adminAccessCode = nanoid(8)
    const participantAccessCode = nanoid(8)

    const checkCode = await this.checkCodeFromSpace(
      adminAccessCode,
      participantAccessCode,
    )

    if (checkCode) {
      throw new ConflictException('already exit space access-code')
    }
    const queryRunner = getConnection().createQueryRunner()
    await queryRunner.startTransaction()

    try {
      const spaceInfo = this.spaceRepo.create()
      spaceInfo.spaceName = createSpaceDto.spaceName
      spaceInfo.spaceLogo = createSpaceDto.spaceLogo
      spaceInfo.adminAccessCode = adminAccessCode
      spaceInfo.participantAccessCode = participantAccessCode

      const space = await this.spaceRepo.save(spaceInfo)

      const spaceToUserInfo = this.spaceToUserRepo.create()
      spaceToUserInfo.owner = true
      spaceToUserInfo.UserId = id
      spaceToUserInfo.SpaceId = space.id

      const spaceToUser = await this.spaceToUserRepo.save(spaceToUserInfo)

      await queryRunner.commitTransaction()
      return
    } catch (err) {
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
  }

  //     private generateAccessCode(): string {

  //     const codeLength = 8
  //     const characters =
  //       'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  //     let code = ''
  //     console.log(characters.length)
  //     for (let i = 0; i < codeLength; i++) {
  //       const randomIndex = Math.floor(Math.random() * characters.length)
  //       code += characters[randomIndex]
  //     }
  //     return code
  //   }

  private async checkCodeFromSpace(
    adminCode: string,
    participantCode: string,
  ): Promise<Space> {
    return await this.spaceRepo
      .createQueryBuilder('space')
      .where(
        '(space.adminAccessCode = :code OR space.participantAccessCode = :code)',
        { code: adminCode },
      )
      .orWhere(
        '(space.adminAccessCode = :code OR space.participantAccessCode = :code)',
        { code: participantCode },
      )
      .getOne()
  }
}
