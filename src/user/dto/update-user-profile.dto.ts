import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { User } from '../user.entity';

export class UpdateUserProfileDto extends PartialType(
  PickType(User, [
    'username',
    'email',
    'firstName',
    'lastName',
    'birthDate',
    'bio',
    'avatar',
  ]),
) {}
