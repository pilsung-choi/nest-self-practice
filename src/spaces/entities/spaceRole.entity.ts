import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Space } from './space.entity'

export enum Role {
  Participant = 'participant',
  Admin = 'admin',
}

@Entity({ schema: 'classum', name: 'space-role' })
export class SpaceRole {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ comment: '역할 이름' })
  spaceRoleName: string

  @Column({ type: 'enum', enum: Role, comment: '역할 권한' })
  role: Role

  @Index()
  @Column('int', { name: 'SpaceId' })
  SpaceId: number

  @ManyToOne(() => Space, (space) => space.id)
  @JoinColumn({ name: 'SpaceId', referencedColumnName: 'id' })
  Space: Space[]
}