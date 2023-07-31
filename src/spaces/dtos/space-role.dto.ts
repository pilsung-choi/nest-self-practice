import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export enum Role {
  Participant = 'participant',
  Admin = 'admin',
}

export class SpaceRoleDto {
  @IsNotEmpty()
  @IsString()
  spaceRoleName: string

  @IsNotEmpty()
  @IsEnum(Role)
  Role: Role
}

export class ParticipationDto extends SpaceRoleDto {
  @IsNotEmpty()
  @IsString()
  code: string
}

export class UpdateRoleFromOwnerDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  spaceId: number

  @IsNotEmpty()
  @IsEnum(Role)
  Role: Role
}

export class UpdateUserToOwnerDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number

  @IsNotEmpty()
  @IsNumber()
  spaceId: number
}
