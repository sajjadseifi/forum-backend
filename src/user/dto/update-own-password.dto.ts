import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateOwnPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @IsNotEmpty()
  currentPassword: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @IsNotEmpty()
  newPassword: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @IsNotEmpty()
  confirmPassword: string;
}
