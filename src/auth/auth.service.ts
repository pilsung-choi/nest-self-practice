import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'users/entites/user.entity'
import { Repository } from 'typeorm'
import bcrypt from 'bcrypt'
import { UserService } from 'users/users.service'
import { LoginDto } from './dtos/login.dto'
import { Payload } from './payload/payload.interface'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RefreshTokenDto } from './dtos/refresh-token.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.userService.findUserByEmail(loginDto.email)
    if (!user) {
      throw new NotFoundException('User not found!')
    }

    if (!(await bcrypt.compare(loginDto.password, user.password))) {
      throw new BadRequestException('Invalid credentials!')
    }

    return user
  }

  async generateAccessToken(user: User): Promise<string> {
    const payload: Payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
    return this.jwtService.signAsync(payload)
  }

  async generateRefreshToken(user: User): Promise<string> {
    const payload: Payload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
    return this.jwtService.signAsync(
      { id: payload.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION_TIME',
        ),
      },
    )
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string }> {
    const { refresh_token } = refreshTokenDto

    // Verify refresh token
    // JWT Refresh Token 검증 로직
    const decodedRefreshToken = this.jwtService.verify(refresh_token, {
      secret: process.env.JWT_REFRESH_SECRET,
    }) as Payload

    // Check if user exists
    const userId = decodedRefreshToken.id
    const user = await this.userService.getUserIfRefreshTokenMatches(
      refresh_token,
      userId,
    )
    if (!user) {
      throw new UnauthorizedException('Invalid user!')
    }

    // Generate new access token
    const accessToken = await this.generateAccessToken(user)

    return { accessToken }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.userId }
    return {
      // access_token: this.jwtService.sign(payload),
    }
  }
}
