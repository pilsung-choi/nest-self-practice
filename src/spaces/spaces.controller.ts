import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'

import { JwtAccessAuthGuard } from 'auth/jwt-access.guard'
import { GetUser } from 'users/decorator/users.decorator'
import { SpaceService } from './spaces.service'
import { CreateSpaceDto } from './dtos/create-space.dto'
import {
  ParticipationDto,
  UpdateRoleFromOwnerDto,
  UpdateUserToOwnerDto,
} from './dtos/space-role.dto'
import { User } from 'users/entites/user.entity'

@UseGuards(JwtAccessAuthGuard)
@Controller('space')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('')
  async createSpacet(
    @GetUser() user: User,
    @Body() createSpaceDto: CreateSpaceDto,
  ) {
    const { id } = user

    return this.spaceService.createSpace(createSpaceDto, id)
  }

  @Get('/myspace')
  async getMySpaces(@GetUser() user: User) {
    const { id } = user

    return this.spaceService.getMySpacesfromId(id)
  }

  @Get('')
  async checkRoleFromCode(@Query('code') code: string) {
    return this.spaceService.getRoleFromSpaceWithCode(code)
  }

  @Post('/participation')
  async participateSpace(
    @GetUser() user: User,
    @Body() participationDto: ParticipationDto,
  ) {
    const { id } = user
    return this.spaceService.joinSpace(id, participationDto)
  }

  @Patch('')
  async updateRoleFromOwner(
    @GetUser() user: User,
    @Body() updateRoleInfo: UpdateRoleFromOwnerDto,
  ) {
    const { id } = user
    return this.spaceService.updateRole(id, updateRoleInfo)
  }

  @Delete('/:spaceId')
  async deleteSpace(
    @GetUser() user: User,
    @Param('spaceId', ParseIntPipe) spaceId: number,
  ) {
    const { id } = user
    return this.spaceService.deleteSpace(id, spaceId)
  }

  @Patch('/owner')
  async updateOwnerFromOwner(
    @GetUser() user: User,
    @Body() targetUser: UpdateUserToOwnerDto,
  ) {
    const { id } = user
    return this.spaceService.updateOwner(id, targetUser)
  }
}
