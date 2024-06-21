import { OmitType } from '@nestjs/mapped-types';
import { CoreEntity } from 'src/common/entity/core.entity';
import { Column, Entity } from 'typeorm';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@Entity()
export class Contact extends CoreEntity {
  @IsString()
  @IsOptional()
  @Column({ nullable: true })
  ipAddress?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(30)
  @Column({ length: 30 })
  fullName: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @Column()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(444)
  @Column({ type: 'text' })
  content: string;
}
