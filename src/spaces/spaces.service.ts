import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { nanoid } from 'nanoid'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, getConnection } from 'typeorm'

import { SpaceToUser } from './entities/spaceToUser.entity'
import { SpaceParticipantRole } from './entities/spaceParticipantRole.entity'
import { Space } from './entities/space.entity'
import { CreateSpaceDto } from './dtos/create-space.dto'
import { ResponseType } from 'common/response-type'
import { SpaceAdminRole } from './entities/spaceAdminRole.entity'
import { ParticipationDto } from './dtos/space-role.dto'

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private spaceRepo: Repository<Space>,
    @InjectRepository(SpaceToUser)
    private spaceToUserRepo: Repository<SpaceToUser>,
    @InjectRepository(SpaceParticipantRole)
    private spaceParticipantRoleRepo: Repository<SpaceParticipantRole>,
    @InjectRepository(SpaceAdminRole)
    private spaceAdminRoleRepo: Repository<SpaceAdminRole>,
  ) {}
  private readonly logger = new Logger('space')

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

      const spaceRoleInfo = this.spaceParticipantRoleRepo.create()
      spaceRoleInfo.SpaceId = space.id

      createSpaceDto.spaceRole.map(async (spaceRole) => {
        let admin: SpaceAdminRole
        let participant: SpaceParticipantRole
        if (spaceRole.Role === 'admin') {
          admin = this.spaceAdminRoleRepo.create()
          admin.SpaceId = space.id
          admin.spaceRoleName = spaceRole.spaceRoleName
          admin.role = spaceRole.Role
          await this.spaceAdminRoleRepo.save(admin)
        } else {
          participant = this.spaceParticipantRoleRepo.create()
          participant.SpaceId = space.id
          participant.spaceRoleName = spaceRole.spaceRoleName
          participant.role = spaceRole.Role
          await this.spaceParticipantRoleRepo.save(participant)
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

  // type 체크
  async getRoleFromSpaceWithCode(code: string) {
    // 코드가 맞는 공간 가져오기
    const param = [code, code]
    const spaces = await getConnection().query(
      `
    select s.id, sdr.spaceRoleName as name, sdr.role as role
    from space s
    left join \`space-admin-role\` sdr on sdr.SpaceId = s.id
    where s.adminAccessCode = ?
    union
    select s.id, spr.spaceRoleName as name, spr.role as role
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

  async joinSpace(userId: string, pInfo: ParticipationDto) {
    // 1.code로 space를 찾고 code가 admin이면 adminrole에있는 이름인지 확인
    // 2. 확인하면 spacetouser에 insert
    const foundRoleFromCode = await this.getRoleFromSpaceWithCode(pInfo.code)

    if (foundRoleFromCode.length === 0) {
      throw new NotFoundException('유효하지 않은 코드입니다.')
    }
    try {
      const check = foundRoleFromCode.map((role) => {
        // 만약 role의 이름과 역할에서 pinfo가 맞지 않는다면 해당 코드에 유효한 역할이 아닙니다
        return role.name === pInfo.spaceRoleName && role.Role === pInfo.Role
      })

      if (check.length === 0) {
        throw new Error('해당 코드에 맞는 역할과 이름이 아닙니다.')
      }

      const STU = this.spaceToUserRepo.create()
      STU.SpaceId = foundRoleFromCode[0].id
      STU.UserId = +userId
      STU.role = pInfo.Role
      STU.spaceRoleNmae = pInfo.spaceRoleName
      await this.spaceToUserRepo.save(STU)
    } catch (err) {
      this.logger.error('something went wrong')
    }
    return
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
