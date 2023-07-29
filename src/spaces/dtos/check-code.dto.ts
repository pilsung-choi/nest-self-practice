import { IsNotEmpty, IsString, Length } from 'class-validator'

export class CheckCodeFromSpaceDto {
  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  adminAccessCode: string

  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  participantAccessCode: string
}
