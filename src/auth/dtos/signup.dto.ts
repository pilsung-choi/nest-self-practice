import { IsEmail, IsNotEmpty, IsString, IsUrl } from 'class-validator'

export class SignupDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsNotEmpty()
  @IsString()
  password: string

  @IsNotEmpty()
  @IsString()
  firstName: string

  @IsNotEmpty()
  @IsString()
  lastName: string

  @IsNotEmpty()
  @IsString()
  profile: string
}
