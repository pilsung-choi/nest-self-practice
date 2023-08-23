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

  @Get('')
  async findOtherProfile() {}

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
