import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { LoginDto } from './dtos/login.dto'
import { Response } from 'express'
import { AuthService } from './auth.service'
import { UserService } from 'users/users.service'
import { User } from 'users/entites/user.entity'
import { JwtAccessAuthGuard } from 'auth/jwt-access.guard'
import { RefreshTokenDto } from './dtos/refresh-token.dto'
import { JwtRefreshGuard } from './jwt-refresh.guard'
import { SignupDto } from './dtos/signup.dto'

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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    // 이메일 비번 확인 후 반환
    const user = await this.authService.validateUser(loginDto)

    const access_token = await this.authService.generateAccessToken(user)
    const refresh_token = await this.authService.generateRefreshToken(user)

    // 유저 객체에 refresh-token 데이터 저장
    await this.userService.setCurrentRefreshToken(refresh_token, user.id)

    res.setHeader('Authorization', 'Bearer ' + [access_token, refresh_token])
    res.cookie('access_token', access_token, {
      httpOnly: true,
    })
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
    })
    return {
      message: 'login success',
      access_token: access_token,
      refresh_token: refresh_token,
    }
  }

  @Post('logout')
  @UseGuards(JwtRefreshGuard)
  async logout(@Req() req: any, @Res() res: Response): Promise<any> {
    //
    await this.userService.removeRefreshToken(req.user.id)
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    return res.send({
      message: 'logout success',
    })
  }

  @Get('authenticate')
  @UseGuards(JwtAccessAuthGuard)
  async user(@Req() req: any, @Res() res: Response): Promise<any> {
    const userId: number = req.user.id
    console.log(req)
    const verifiedUser: User = await this.userService.findUserById(userId)
    return res.send(verifiedUser)
  }

  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const newAccessToken = (await this.authService.refresh(refreshTokenDto))
        .accessToken
      res.setHeader('Authorization', 'Bearer ' + newAccessToken)
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
      })
      res.send({ newAccessToken })
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh-token')
    }
  }
}
