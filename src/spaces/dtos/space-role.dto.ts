import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator'

export enum Role {
  Participant = 'participant',
  Admin = 'admin',
}

export class CreateSpaceRoleDto {
  @IsString()
  @IsNotEmpty()
  spaceRoleName: string

  @IsNotEmpty()
  @IsEnum(Role)
  Role: Role
}
