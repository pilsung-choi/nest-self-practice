import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createdAt: Date

  @CreateDateColumn()
  updatedAt: Date

  @CreateDateColumn()
  deletedAt: Date

  @Column({
    unique: true,
    comment: '회원 이메일',
  })
  email: string

  @Column({
    comment: '회원 비밀번호',
  })
  password: string

  @Column({
    comment: '회원 이름',
  })
  firstName: string

  @Column({
    comment: '회원 성',
  })
  lastName: string

  @Column({
    comment: '회원 프로필 사진',
  })
  profile: string

  @Column({ nullable: true })
  currentRefreshToken: string

  @Column({ type: 'datetime', nullable: true })
  currentRefreshTokenExp: Date
}
