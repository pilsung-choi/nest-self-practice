import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { SpaceToUser } from './spaceToUser.entity'
import { SpaceRole } from './spaceRole.entity'

@Entity({ schema: 'classum', name: 'space' })
export class Space {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @CreateDateColumn()
  updatedAt: Date

  @CreateDateColumn()
  deletedAt: Date

  @Column({
    comment: '공간 이름',
  })
  spaceName: string

  @Column({
    comment: '공간 로고',
  })
  spaceLogo: string

  @Column({ comment: '관리자용 입장코드', unique: true })
  adminAccessCode: string

  @Column({ comment: '참여자용 입장코드', unique: true })
  participantAccessCode: string

  @OneToMany(() => SpaceToUser, (spaceToUser) => spaceToUser.SpaceId)
  SpaceToUser: SpaceToUser

  @OneToMany(() => SpaceRole, (spaceRole) => spaceRole.id)
  SpaceRole: SpaceRole

  // @OneToMany(() => Post, (post) => post.id)
  // 매핑 테이블
}
