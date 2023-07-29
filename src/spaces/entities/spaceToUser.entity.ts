import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { User } from 'users/entites/user.entity'
import { Space } from './space.entity'

@Entity({ schema: 'classum', name: 'space-to-user' })
export class SpaceToUser {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    comment: '소유자',
    default: false,
  })
  owner: boolean

  // @Column({
  //   comment: '해당 유저가 속해있는 space의 역할',
  // })
  // spaceRoleId: number

  @Index()
  @Column('int', { name: 'UserId', nullable: true })
  UserId: number

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'UserId', referencedColumnName: 'id' })
  User: User[]

  @Index()
  @Column('int', { name: 'SpaceId', nullable: true })
  SpaceId: number

  @ManyToOne(() => Space, (space) => space.id)
  @JoinColumn({ name: 'SpaceId', referencedColumnName: 'id' })
  Space: Space[]
}