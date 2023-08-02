import { Space } from 'spaces/entities/space.entity'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
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

  @Column({ comment: '계시글 올린 유저 이름', select: false })
  writer: string

  @Index()
  @Column('int', { name: 'SpaceId' })
  SpaceId: number

  @ManyToOne(() => Space, (space) => space.id)
  @JoinColumn({ name: 'SpaceId', referencedColumnName: 'id' })
  Space: Space[]
}
