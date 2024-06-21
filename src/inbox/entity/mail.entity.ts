import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CoreEntity } from 'src/common/entity/core.entity';
import { User } from 'src/user/user.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  getRepository,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { TupleMailStatus } from './tuple-mail-satus.enum';
import { v4 as uuid } from 'uuid';
import { Transform } from 'class-transformer';
import { MailSection } from '../enum/mail-category.enum';
@Entity()
export class Mail extends CoreEntity {
  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => User)
  reciever: User;

  @Column({ enum: MailSection, default: MailSection.OTHER })
  @IsEnum(MailSection)
  section: MailSection;

  @Column()
  groupId: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUUID()
  replyId?: string;

  @ManyToOne(() => Mail, (reply) => reply.id)
  @JoinColumn({ name: 'replyId' })
  reply?: Mail;

  @Column({ length: 60, nullable: true, update: false })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @MinLength(1)
  subject: string;

  @Column({ type: 'text', nullable: false, update: false })
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  content: string;

  @Column({ default: false, update: false })
  @IsBoolean()
  @IsOptional()
  @Transform((p) => !!p.value, { toPlainOnly: true })
  isHtmlContnet?: boolean;

  @Column({ default: false })
  isRead: boolean; // for reciever

  @Column({ default: false })
  isSpan: boolean; // for reciever

  @Column({ enum: TupleMailStatus, default: TupleMailStatus.NONE })
  @IsEnum(TupleMailStatus)
  important: TupleMailStatus;

  isImportant?: boolean;

  @Column({ enum: TupleMailStatus, default: TupleMailStatus.NONE })
  @IsEnum(TupleMailStatus)
  stared: TupleMailStatus;
  isStared?: boolean;

  @Column({ enum: TupleMailStatus, default: TupleMailStatus.NONE })
  @IsEnum(TupleMailStatus)
  trash: TupleMailStatus;

  isTrash?: boolean;

  @Column({ enum: TupleMailStatus, default: TupleMailStatus.NONE })
  @IsEnum(TupleMailStatus)
  delete: TupleMailStatus;

  isDelete?: boolean;

  @BeforeInsert()
  async initGroupId() {
    if (!this.replyId) {
      this.groupId = uuid();
      return;
    }

    const reply = await getRepository(Mail).findOne({
      select: ['id', 'groupId'],
      where: { id: this.replyId },
    });

    this.groupId = reply.groupId;
  }
  isSender(user: User) {
    return user.id === this.sender.id;
  }

  afterStatus(user: User, status: TupleMailStatus): TupleMailStatus {
    const isSender = this.isSender(user);
    const addition = isSender
      ? TupleMailStatus.SENDER
      : TupleMailStatus.RECIEVER;

    switch (status) {
      case TupleMailStatus.SENDER_RECIEVER:
        return TupleMailStatus.SENDER_RECIEVER - addition;

      case TupleMailStatus.SENDER | TupleMailStatus.RECIEVER:
        const direction =
          (isSender && status === TupleMailStatus.SENDER) ||
          (!isSender && status === TupleMailStatus.RECIEVER)
            ? -1
            : 1;

        return TupleMailStatus.SENDER_RECIEVER + direction * addition;

      default:
        return TupleMailStatus.NONE;
    }
  }

  private convertToBoolStatus(user: User, status: TupleMailStatus) {
    if (status === TupleMailStatus.SENDER_RECIEVER) return true;

    if (status === TupleMailStatus.NONE) return false;

    if (this.isSender(user)) return status === TupleMailStatus.SENDER;

    return status === TupleMailStatus.RECIEVER;
  }

  toBoolFields(user: User) {
    this.isImportant = this.convertToBoolStatus(user, this.important);
    this.isStared = this.convertToBoolStatus(user, this.stared);
    this.isTrash = this.convertToBoolStatus(user, this.trash);
    this.isDelete = this.convertToBoolStatus(user, this.delete);
  }
}
