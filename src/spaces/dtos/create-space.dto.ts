import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator'
import { CreateSpaceRoleDto } from './space-role.dto'

export class CreateSpaceDto {
  @IsString()
  @IsNotEmpty()
  spaceName: string

  @IsString()
  @IsNotEmpty()
  spaceLogo: string

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => CreateSpaceRoleDto)
  spaceRole: CreateSpaceRoleDto[]
}
