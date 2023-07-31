import {
  Column,
  CreateDateColumn,
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

@Entity({ schema: 'classum', name: 'space-participant-role' })
export class SpaceParticipantRole {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @CreateDateColumn()
  updatedAt: Date

  @CreateDateColumn()
  deletedAt: Date

  @Column({ comment: '역할 이름' })
  spaceRoleName: string

  @Column({
    type: 'enum',
    enum: Role,
    comment: '역할 권한',
    default: 'participant',
  })
  role: Role

  @Index()
  @Column('int', { name: 'SpaceId' })
  SpaceId: number

  @ManyToOne(() => Space, (space) => space.id)
  @JoinColumn({ name: 'SpaceId', referencedColumnName: 'id' })
  Space: Space[]
}
