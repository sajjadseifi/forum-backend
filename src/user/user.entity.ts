import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { CoreEntity } from 'src/common/entity/core.entity';
import { Exclude } from 'class-transformer';
import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Category } from 'src/category/category.entity';

@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  birthDate: Date;

  @OneToMany(() => Category, (c) => c.user)
  categories: Category[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (!this.password) return;
    try {
      this.password = await bcrypt.hash(this.password, 10);
      console.log('this.password', this.password);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async checkPassword(password: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(password, this.password);
      return ok;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
