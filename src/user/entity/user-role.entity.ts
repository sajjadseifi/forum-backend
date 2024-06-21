import { BadRequestException } from '@nestjs/common';
import { Exclude } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { CoreEntity } from 'src/common/entity/core.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { User } from '../user.entity';

export enum RoleSection {
  MAIN = 'MAIN',
  POST = 'POST',
  FORUM = 'FORUM',
  TOPIC = 'TOPIC',
  USER = 'USER',
  ROLE = 'ROLE',
  CATEGORY = 'CATEGORY',
}
export const RolesStatic = [
  RoleSection.MAIN,
  RoleSection.USER,
  RoleSection.ROLE,
  RoleSection.CATEGORY,
  RoleSection.FORUM,
  RoleSection.TOPIC,
  RoleSection.POST,
];
@Entity()
@Unique(['user', 'section'])
export class UserRole extends CoreEntity {
  @IsEnum(RoleSection)
  @IsNotEmpty()
  @Column({ enum: RoleSection })
  section: RoleSection;

  @IsBoolean()
  @IsOptional()
  @Column({ default: false })
  canCreate?: boolean;

  @IsBoolean()
  @IsOptional()
  @Column({ default: true })
  canRead?: boolean;

  @IsBoolean()
  @IsOptional()
  @Column({ default: false })
  canUpdate?: boolean;

  @IsBoolean()
  @IsOptional()
  @Column({ default: false })
  canDelete?: boolean;

  @ManyToOne(() => User, (u) => u.roles)
  user: User;

  @OneToMany(() => User, (u) => u.authoredUsers)
  @JoinTable()
  author: User;

  // @BeforeInsert()
  // notAlloedUserAddOwnRole() {
  //   if (this.user?.id == this.author?.id) {
  //     throw new BadRequestException('شما نمیتوانید به خودتان دسترسی بدهید');
  //   }
  // }

  all() {
    this.canCreate = true;
    this.canRead = true;
    this.canUpdate = true;
    this.canDelete = true;
  }
  isOneAccess() {
    return this.canCreate || this.canRead || this.canUpdate || this.canDelete;
  }
  pretifyAccess() {
    const access: any = {};
    this.canCreate && (access.canCreate = this.canCreate);
    this.canRead && (access.canRead = this.canRead);
    this.canUpdate && (access.canUpdate = this.canUpdate);
    this.canDelete && (access.canDelete = this.canDelete);

    return access;
  }
}
