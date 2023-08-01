import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common'

import { AuthService } from './auth.service'
import { UserService } from 'users/users.service'
import { LoginDto } from './dtos/login.dto'
import { SignupDto } from './dtos/signup.dto'
import { User } from 'users/entites/user.entity'
import { RefreshTokenDto } from './dtos/refresh-token.dto'
import { JwtAccessAuthGuard } from 'auth/jwt-access.guard'
import { GetUser } from 'users/decorator/users.decorator'

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    const checkEmail = await this.userService.findUserByEmail(signupDto.email)

    if (checkEmail) {
      throw new ConflictException(
        `this email:${signupDto.email} already exists`,
      )
    }

    await this.userService.createUser(signupDto)
    return { message: 'signup success' }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    // 이메일 비번 확인 후 반환
    const user = await this.authService.validateUser(loginDto)

    const access_token = await this.authService.generateAccessToken(user)
    const refresh_token = await this.authService.generateRefreshToken(user)

    // 유저 객체에 refresh-token 데이터 저장
    await this.userService.setCurrentRefreshToken(refresh_token, user.id)

    return {
      message: 'login success',
      access_token: access_token,
      refresh_token: refresh_token,
    }
  }

  @Post('logout')
  @UseGuards(JwtAccessAuthGuard)
  async logout(@GetUser() user: User) {
    const { id } = user
    await this.userService.removeRefreshToken(id)

    return {
      message: 'logout success',
    }
  }

  @Get('authenticate')
  @UseGuards(JwtAccessAuthGuard)
  async user(@GetUser() user: User) {
    const { id } = user
    return this.userService.findUserById(id)
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto)
  }
}
