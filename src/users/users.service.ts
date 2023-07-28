import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './entites/user.entity'
import { Repository } from 'typeorm'
import bcrypt from 'bcrypt'
import { ConfigService } from '@nestjs/config'
import { SignupDto } from 'auth/dtos/signup.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async getCurrentHashedRefreshToken(refreshToken: string) {
    // 토큰 값을 그대로 저장하기 보단, 암호화를 거쳐 데이터베이스에 저장한다.
    // bcrypt는 단방향 해시 함수이므로 암호화된 값으로 원래 문자열을 유추할 수 없다.

    const currentRefreshToken = await bcrypt.hash(
      refreshToken,
      +this.configService.get<number>('SALT_OR_ROUNDS'),
    )
    return currentRefreshToken
  }

  async getCurrentRefreshTokenExp(): Promise<Date> {
    const currentDate = new Date()
    // Date 형식으로 데이터베이스에 저장하기 위해 문자열을 숫자 타입으로 변환 (paresInt)

    const currentRefreshTokenExp = new Date(
      currentDate.getTime() +
        parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME')),
    )
    return currentRefreshTokenExp
  }

  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const currentRefreshToken = await this.getCurrentHashedRefreshToken(
      refreshToken,
    )
    const currentRefreshTokenExp = await this.getCurrentRefreshTokenExp()
    await this.userRepo.update(userId, {
      currentRefreshToken: currentRefreshToken,
      currentRefreshTokenExp: currentRefreshTokenExp,
    })
  }

  async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: number,
  ): Promise<User> {
    const user: User = await this.findUserById(userId)

    // user에 currentRefreshToken이 없다면 null을 반환 (즉, 토큰 값이 null일 경우)
    if (!user.currentRefreshToken) {
      return null
    }

    // 유저 테이블 내에 정의된 암호화된 refresh_token값과 요청 시 body에 담아준 refresh_token값 비교
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentRefreshToken,
    )

    // 만약 isRefreshTokenMatching이 true라면 user 객체를 반환
    if (isRefreshTokenMatching) {
      return user
    }
  }

  async removeRefreshToken(userId: number): Promise<any> {
    return await this.userRepo.update(userId, {
      currentRefreshToken: null,
      currentRefreshTokenExp: null,
    })
  }

  async createUser(signupDto: SignupDto) {
    console.log(process.env.SALT_OR_ROUNDS)
    const hashedPassword = await bcrypt.hash(
      signupDto.password,
      +process.env.SALT_OR_ROUNDS,
    )

    const user = this.userRepo.create()
    user.email = signupDto.email
    user.password = hashedPassword
    user.firstName = signupDto.firstName
    user.lastName = signupDto.lastName
    user.profile = signupDto.profile

    return await this.userRepo.save(user)
  }

  async findUserByEmail(email: string) {
    return await this.userRepo.findOne({ email })
  }

  async findUserById(id: number) {
    return await this.userRepo.findOne({ id })
  }
}
