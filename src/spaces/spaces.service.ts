import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { nanoid } from 'nanoid'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, getConnection } from 'typeorm'

import { SpaceToUser } from './entities/spaceToUser.entity'
import { SpaceParticipantRole } from './entities/spaceParticipantRole.entity'
import { Space } from './entities/space.entity'
import { CreateSpaceDto } from './dtos/create-space.dto'
import { ParticipationDto } from './dtos/participation.dto'
import { ResponseType } from 'common/response-type'
import { SpaceAdminRole } from './entities/spaceAdminRole.entity'

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private spaceRepo: Repository<Space>,
    @InjectRepository(SpaceToUser)
    private spaceToUserRepo: Repository<SpaceToUser>,
    @InjectRepository(SpaceParticipantRole)
    private spaceParticipantRole: Repository<SpaceParticipantRole>,
    @InjectRepository(SpaceAdminRole)
    private spaceAdminRole: Repository<SpaceAdminRole>,
  ) {}

  // 에러처리 해야함 space는 insert됨
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
      // 1. space를 만든다 0
      // 2. spaceToUser 만든다 0
      // 3. 역할에 따른 Role 만든다
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

      const spaceRoleInfo = this.spaceParticipantRole.create()
      spaceRoleInfo.SpaceId = space.id

      createSpaceDto.spaceRole.map(async (spaceRole) => {
        let admin: SpaceAdminRole
        let participant: SpaceParticipantRole
        if (spaceRole.Role === 'admin') {
          admin = this.spaceAdminRole.create()
          admin.SpaceId = space.id
          admin.spaceRoleName = spaceRole.spaceRoleName
          admin.role = spaceRole.Role
          await this.spaceAdminRole.save(admin)
        } else {
          participant = this.spaceParticipantRole.create()
          participant.SpaceId = space.id
          participant.spaceRoleName = spaceRole.spaceRoleName
          participant.role = spaceRole.Role
          await this.spaceParticipantRole.save(participant)
        }
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

  async getRoleFromSpaceWithCode(code: string): Promise<ResponseType> {
    // 코드가 맞는 공간 가져오기
    const param = [code, code]
    const spaces = await getConnection().query(
      `
    select sdr.spaceRoleName as name, sdr.role as role
    from space s
    left join \`space-admin-role\` sdr on sdr.SpaceId = s.id
    where s.adminAccessCode = ?
    union
    select spr.spaceRoleName as name, spr.role as role
    from space s
    left join \`space-participant-role\` spr on spr.SpaceId = s.id
    where s.participantAccessCode = ?
    `,
      param,
    )

    if (spaces.length === 0) {
      throw new NotFoundException('유효하지 않은 코드입니다.')
    }
    return spaces
  }

  async joinSpace(id: string, pInfo: ParticipationDto) {
    //
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

// SELECT
// CASE
//     WHEN s.adminAccessCode = 'w73Jh9Yc' THEN sr_admin.spaceRoleName
//     WHEN s.participantAccessCode = 'w73Jh9Yc' THEN sr_participant.spaceRoleName
// END AS result
// FROM space s
// LEFT JOIN `space-role` sr_admin ON sr_admin.SpaceId = s.id AND sr_admin.role = 'admin'
// LEFT JOIN `space-role` sr_participant ON sr_participant.SpaceId = s.id AND sr_participant.role = 'participant'
// WHERE s.adminAccessCode = 'w73Jh9Yc' OR s.participantAccessCode = 'w73Jh9Yc' ;
