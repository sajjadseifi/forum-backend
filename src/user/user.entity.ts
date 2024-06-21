import {
  AfterInsert,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  getRepository,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { CoreEntity } from 'src/common/entity/core.entity';
import { Exclude } from 'class-transformer';
import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Category } from 'src/category/category.entity';
import { Forum } from 'src/forum/forum.entity';
import { Topic } from 'src/topic/topic.entity';
import { Posts } from 'src/post/post.entity';
import { RoleSection, RolesStatic, UserRole } from './entity/user-role.entity';
import { LikePostStatus, userlikePostCounts } from 'src/post/like-post.entity';
import { countRepository } from 'src/common/repository/counts-repository';
import { v1 as uuid } from 'uuid';
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { v4 } from 'uuid';
import { Mail } from 'src/inbox/entity/mail.entity';
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @IsString()
  username: string;

  @Column({ unique: true })
  @IsString()
  @IsEmail()
  email: string;

  @Column()
  @Exclude()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;

  @Column({ nullable: true })
  @MaxLength(20)
  @MinLength(3)
  @IsOptional()
  firstName: string;

  @Column({ nullable: true })
  @MaxLength(20)
  @MinLength(3)
  @IsOptional()
  lastName: string;

  @Column({ nullable: true })
  @IsOptional()
  bio: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  avatar: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  birthDate: Date;

  @OneToMany(() => Category, (c) => c.user)
  categories: Category[];

  @OneToMany(() => Forum, (f) => f.user)
  forums: Forum[];

  @OneToMany(() => Topic, (t) => t.user)
  topics: Topic[];

  @OneToMany(() => Posts, (p) => p.user)
  posts: Posts[];

  @ManyToMany(() => Topic, (t) => t.topiclikedUsers)
  userlikesTpic: Topic[];

  @ManyToMany(() => Mail, (m) => m.sender)
  sendesMail: Mail[];

  @ManyToMany(() => Mail, (m) => m.reciever)
  recievesMail: Mail[];

  @OneToMany(() => UserRole, (r) => r.user)
  @JoinTable()
  roles: UserRole[];

  @OneToMany(() => UserRole, (r) => r.user)
  authoredUsers: UserRole[];

  @Column({ nullable: true })
  registeredToken: string;

  @Column({ nullable: true })
  verificationCode: string;

  @Column({ default: false })
  verifyed: boolean;

  isAdmin?: boolean;
  root?: boolean;
  postsCount?: number;
  topicsCount?: number;
  forumsCount?: number;
  likedPostCount?: number;
  disLikedPostCount?: number;
  likedTopicCount?: number;

  @BeforeInsert()
  genVerificationCode() {
    this.verificationCode = v4();
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (!this.password) {
      this.password = uuid().split('-')[0];
    }
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @BeforeUpdate()
  async removeRegisteredToken() {
    this.registeredToken = null;
  }

  async checkPassword(password: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(password, this.password);
      return ok;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @AfterLoad()
  async checkAdmin() {
    const user = await getRepository(UserRole).count({ where: { user: this } });
    this.isAdmin = !!user;
    if (this.isAdmin) {
      this.root = this.username === 'admin';
    }
  }

  async detaolsCounting() {
    this.postsCount = await countRepository(Posts, 'userId', this.id);
    this.topicsCount = await countRepository(Topic, 'userId', this.id);
    this.forumsCount = await countRepository(Forum, 'userId', this.id);
    this.likedTopicCount = await countRepository(
      'user_like_topic',
      'userId',
      this.id,
    );
    this.likedPostCount = await userlikePostCounts(
      this.id,
      LikePostStatus.LIKE,
    );
    this.disLikedPostCount = await userlikePostCounts(
      this.id,
      LikePostStatus.DISLIKE,
    );
  }

  @AfterLoad()
  formatedRoles() {
    if (!this.roles || this.roles.length === 0) return;
    const macss = this.roles.find((role) => role.section === RoleSection.MAIN);

    if (!macss || !macss.isOneAccess()) return;
    const access = macss.pretifyAccess();
    const mainRoles = RolesStatic.map((section) => ({
      ...access,
      section,
    })) as UserRole[];

    const roles = mainRoles.map((mrole) => {
      const role = this.roles.find((role) => role.section === mrole.section);
      if (!role) return mrole;

      return {
        ...role,
        ...mrole,
      };
    }) as UserRole[];
    this.roles = roles;
  }
}
