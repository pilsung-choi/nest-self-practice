import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { SpaceToUser } from './spaceToUser.entity'
import { SpaceParticipantRole } from './spaceParticipantRole.entity'
import { SpaceAdminRole } from './spaceAdminRole.entity'
import { Post } from 'posts/entities/posts.entity'

@Entity({ schema: 'classum', name: 'space' })
export class Space {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date

  @Column({
    comment: '공간 이름',
  })
  spaceName: string

  @Column({
    comment: '공간 로고',
  })
  spaceLogo: string

  @Column({ comment: '관리자용 입장코드', unique: true, select: false })
  adminAccessCode: string

  @Column({ comment: '참여자용 입장코드', unique: true, select: false })
  participantAccessCode: string

  @OneToMany(() => SpaceToUser, (spaceToUser) => spaceToUser.id, {
    onDelete: 'CASCADE',
  })
  SpaceToUser: SpaceToUser

  @OneToMany(() => SpaceParticipantRole, (spacePRole) => spacePRole.id, {
    onDelete: 'CASCADE',
  })
  SpacePRole: SpaceParticipantRole

  @OneToMany(() => SpaceAdminRole, (spaceARole) => spaceARole.id, {
    onDelete: 'CASCADE',
  })
  SpaceARole: SpaceAdminRole

  @OneToMany(() => Post, (post) => post.id, {
    onDelete: 'CASCADE',
  })
  Post: Post
}
