import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'

import { JwtAccessAuthGuard } from 'auth/jwt-access.guard'
import { SpaceService } from './spaces.service'
import { CreateSpaceDto } from './dtos/create-space.dto'
import {
  ParticipationDto,
  UpdateRoleFromOwnerDto,
  UpdateUserToOwnerDto,
} from './dtos/space-role.dto'
import { deleteSpaceDto } from './dtos/delete-space.dto'

@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  // 1. 클라썸은 여러 공간으로 구성되어 있습니다.
  //     1. 공간 개설 시, 이름과 로고, 공간 내에서 사용할 역할(SpaceRole)을 함께 설정할 수 있습니다.
  // 2. 유저는 자신이 참여 중인 공간 목록을 조회할 수 있습니다.
  // 3. 유저는 자유롭게 공간을 개설하거나, 다른 공간에 참여할 수 있습니다.
  //     1. 공간을 개설할 경우, 유저는 소유자로 공간에 참여합니다.
  //     2. 소유자는 관리자와 같은 역할을 공유하며, 관리자가 지닌 모든 권한을 갖습니다.
  //     3. 이에 추가로 공간 구성원의 권한을 변경할 수 있는 권한 및 공간을 삭제할 수 있는 권한을 갖습니다.
  //     4. 소유자는 다른 구성원을 소유자로 임명할 수 있습니다.
  // 4. 개설된 공간은 관리자용 입장 코드와 참여자용 입장 코드를 가집니다.
  //     1. 코드는 영문 + 숫자의 조합으로 구성된 8자리 문자열입니다.
  //     2. 유저는 입장 코드를 통해 공간에 참여할 수 있습니다. 이 때 권한은 사용한 코드에 따라 결정됩니다.

  // 공간 계설 -> 1.1참고
  @UseGuards(JwtAccessAuthGuard)
  @Post('')
  async createSpacet(@Req() req: any, @Body() createSpaceDto: CreateSpaceDto) {
    const { id } = req.user

    return this.spaceService.createSpace(createSpaceDto, id)
  }

  // 해당 유저가 속해있는 space조회
  @UseGuards(JwtAccessAuthGuard)
  @Get('/myspace')
  async getMySpaces(@Req() req: any) {
    const { id } = req.user

    return this.spaceService.getMySpacesfromId(id)
  }

  // code입력 후, 해당 권한에 맞는 역할 조회
  @UseGuards(JwtAccessAuthGuard)
  @Get('')
  async checkRoleFromCode(@Query('code') code: string) {
    return this.spaceService.getRoleFromSpaceWithCode(code)
  }

  @UseGuards(JwtAccessAuthGuard)
  @Post('/participation')
  async participateSpace(
    @Req() req: any,
    @Body() participationDto: ParticipationDto,
  ) {
    const { id } = req.user
    return this.spaceService.joinSpace(id, participationDto)
  }

  //   2. 소유자는 관리자와 같은 역할을 공유하며, 관리자가 지닌 모든 권한을 갖습니다.
  //   3. 이에 추가로 공간 구성원의 권한을 변경할 수 있는 권한 및 공간을 삭제할 수 있는 권한을 갖습니다.

  // space 구성원의 권한을 변경 (소유자만)
  @UseGuards(JwtAccessAuthGuard)
  @Patch('')
  async updateRoleFromOwner(
    @Req() req: any,
    @Body() updateRoleInfo: UpdateRoleFromOwnerDto,
  ) {
    const { id } = req.user
    return this.spaceService.updateRole(id, updateRoleInfo)
  }

  // space삭제 (소유자만)
  @UseGuards(JwtAccessAuthGuard)
  @Delete('/:spaceId')
  async deleteSpace(@Req() req: any, @Param() spaceId: deleteSpaceDto) {
    const { id } = req.user

    return this.spaceService.deleteSpace(id, spaceId)
  }

  // 4. 소유자는 다른 구성원을 소유자로 임명할 수 있습니다.
  @UseGuards(JwtAccessAuthGuard)
  @Patch('/owner')
  async updateOwnerFromOwner(
    @Req() req: any,
    @Body() targetUser: UpdateUserToOwnerDto,
  ) {
    const { id } = req.user
    return this.spaceService.updateOwner(id, targetUser)
  }
}
