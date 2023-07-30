import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class ParticipationDto {
  @IsString()
  @IsNotEmpty()
  code: string

  @IsNotEmpty()
  @IsString()
  spaceRoleName: string
}
