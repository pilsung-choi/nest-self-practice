import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export enum Types {
  Notification = 'notification',
  Question = 'question',
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string

  @IsString()
  @IsNotEmpty()
  @IsEnum(Types)
  type: Types

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  spaceId: number
}
