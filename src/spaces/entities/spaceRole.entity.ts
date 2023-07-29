import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Space } from './space.entity'

@Entity({ schema: 'classum', name: 'space-role' })
export class SpaceRole {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  spaceRoleName: string

  @Column()
  admin: boolean

  @Index()
  @Column('int', { name: 'SpaceId' })
  SpaceId: number

  @ManyToOne(() => Space, (space) => space.id)
  @JoinColumn({ name: 'SpaceId', referencedColumnName: 'id' })
  Space: Space[]
}
