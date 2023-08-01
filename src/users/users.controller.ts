import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { JwtAccessAuthGuard } from 'auth/jwt-access.guard'
import { UserService } from './users.service'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 1. 유저는 이메일, 성, 이름, 프로필 사진을 갖습니다.
  // 2. 다른 유저의 프로필을 조회할 수 있습니다. 단, 다른 유저의 이메일은 조회할 수 없습니다.
  // 3. 유저는 자신의 프로필을 조회하고, 이메일을 제외한 나머지를 수정할 수 있습니다.
  // 4. 유저는 자신이 작성한 글 목록 및 댓글 목록을 모아볼 수 있습니다.

  // 2. 다른 유저의 프로필을 조회할 수 있습니다. 단, 다른 유저의 이메일은 조회할 수 없습니다.
  @Get('')
  async findOtherProfile() {}

  // 3. 유저는 자신의 프로필을 조회하고, 이메일을 제외한 나머지를 수정할 수 있습니다.
  @UseGuards(JwtAccessAuthGuard)
  @Get('/my-profile')
  async getMyProfil(@Req() req: any) {
    const { id } = req.user
    return this.userService.findUserById(id)
  }

  @UseGuards(JwtAccessAuthGuard)
  @Patch('')
  async updateMyInfo(@Req() req: any, @Body() updateInfo) {}
}
