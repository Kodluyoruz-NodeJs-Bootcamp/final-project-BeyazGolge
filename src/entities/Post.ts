import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  BaseEntity,
} from 'typeorm';
import User from './User';
import Actor from './Actor';
import Comment from './Comment';
import Liked from './Liked';
import Film from './Film';

@Entity('Post')
export default class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column()
  public?: boolean;

  @Column()
  entityId!: string;

  @Column()
  entityType!: string;

  @ManyToOne(() => User, (user) => user.posts)
  user?: User;

  @OneToMany(() => Liked, (liked) => liked.post)
  likes?: Liked[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments?: Comment[];

  public async owner() {
    return this.entityType === 'Film'
      ? await Film.findOne(this.entityId)
      : await Actor.findOne(this.entityId);
  }
}
