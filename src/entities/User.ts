import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import Liked from './Liked';
import Comment from './Comment';
import Post from './Post';

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name!: string;

  @Column({
    unique: true,
  })
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Liked, (liked) => liked.user)
  likes?: Liked[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments?: Comment[];

  @OneToMany(() => Post, (post) => post.user)
  posts?: Post[];
}
