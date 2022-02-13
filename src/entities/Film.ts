import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import Post from './Post';

@Entity()
export default class Film extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  name?: string;

  @Column()
  image?: string;

  public async posts() {
    return await Post.find({
      where: { entityId: this.id, entityType: this.constructor.name },
    });
  }
}
