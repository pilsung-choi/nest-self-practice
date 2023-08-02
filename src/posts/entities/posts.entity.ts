import { Space } from 'spaces/entities/space.entity'
import { SpaceToUser } from 'spaces/entities/spaceToUser.entity'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export enum Type {
  Notification = 'notification',
  Question = 'question',
}

@Entity({ schema: 'classum', name: 'post' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date

  @Column('text', { comment: '파일 혹은 이미지', nullable: true })
  content: string

  @Column('text', { comment: '게시글' })
  post: string

  @Column({
    type: 'enum',
    enum: Type,
    comment: '해당 post의 타입 (공지, 질문)',
    nullable: true,
  })
  type: Type

  @Index()
  @Column('int', { comment: '계시글 올린 유저 이름', select: false })
  WriterId: number

  @ManyToOne(() => SpaceToUser, (spaceToUser) => spaceToUser.id)
  @JoinColumn({ name: 'WriterId', referencedColumnName: 'id' })
  Writer: SpaceToUser[]

  @Index()
  @Column('int', { name: 'SpaceId' })
  SpaceId: number

  @ManyToOne(() => Space, (space) => space.id)
  @JoinColumn({ name: 'SpaceId', referencedColumnName: 'id' })
  Space: Space[]

  // chat 관계설정
  // @OneToMany(() => Chat)
}
