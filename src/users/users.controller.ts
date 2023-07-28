import { Body, Controller, Get, Post, Res } from '@nestjs/common'

@Controller('user')
export class UserController {
  constructor() {}

  @Post('/signup')
  async createUser(@Body() body) {
    // 구현
  }

  @Get('test')
  async test() {
    return 'hihi'
  }
}
