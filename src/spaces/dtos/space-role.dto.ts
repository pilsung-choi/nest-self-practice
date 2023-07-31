import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export enum Role {
  Participant = 'participant',
  Admin = 'admin',
}

export class SpaceRoleDto {
  @IsString()
  @IsNotEmpty()
  spaceRoleName: string

  @IsNotEmpty()
  @IsEnum(Role)
  Role: Role
}

export class ParticipationDto extends SpaceRoleDto {
  @IsString()
  @IsNotEmpty()
  code: string
}
