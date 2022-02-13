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
export default class Liked extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column()
  Liked?: boolean;

  @ManyToOne(() => User, (user) => user.likes)
  user?: User;

  @ManyToOne(() => Post, (post) => post.likes)
  post?: Post;
}
