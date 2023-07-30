import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { nanoid } from 'nanoid'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, getConnection } from 'typeorm'

import { SpaceToUser } from './entities/spaceToUser.entity'
import { SpaceRole } from './entities/spaceRole.entity'
import { Space } from './entities/space.entity'
import { CreateSpaceDto } from './dtos/create-space.dto'
import { ResponseType } from 'common/response-type'

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private spaceRepo: Repository<Space>,
    @InjectRepository(SpaceToUser)
    private spaceToUserRepo: Repository<SpaceToUser>,
    @InjectRepository(SpaceRole)
    private spaceRole: Repository<SpaceRole>,
  ) {}

  async createSpace(
    createSpaceDto: CreateSpaceDto,
    id: number,
  ): Promise<ResponseType> {
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

      await this.spaceToUserRepo.save(spaceToUserInfo)

      const spaceRoleInfo = this.spaceRole.create()
      spaceRoleInfo.SpaceId = space.id

      createSpaceDto.spaceRole.map(async (spaceRole) => {
        const spaceRoleInfo = this.spaceRole.create()
        spaceRoleInfo.role = spaceRole.Role
        spaceRoleInfo.spaceRoleName = spaceRole.spaceRoleName
        spaceRoleInfo.SpaceId = space.id

        await this.spaceRole.save(spaceRoleInfo)
      })

      await queryRunner.commitTransaction()
      return
    } catch (err) {
      await queryRunner.rollbackTransaction()
    } finally {
      await queryRunner.release()
    }
  }

  async getMySpacesfromId(id: number): Promise<SpaceToUser[]> {
    const spaceToUserAlias = 'spaceToUser'
    const spaceAlias = 'space'

    const spaces = await this.spaceToUserRepo
      .createQueryBuilder(`spaceToUser`)
      .leftJoinAndSelect('spaceToUser.Space', 'SpaceId')
      .where('spaceToUser.UserId = :userId', { userId: id })
      .getMany()

    if (!spaces) {
      throw new NotFoundException("space dosen't exit")
    }

    return spaces
  }

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
