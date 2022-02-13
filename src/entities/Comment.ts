import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
} from 'typeorm';
import Post from './Post';
import User from './User';

@Entity()
export default class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column()
  comment?: string;

  @ManyToOne(() => User, (user) => user.comments)
  user?: User;

  @ManyToOne(() => Post, (post) => post.comments)
  post?: Post;
}
