import { IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class deleteSpaceDto {
  @IsNumber()
  @Type(() => Number)
  spaceId: number
}
