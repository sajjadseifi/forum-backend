import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from 'src/auth/auth.decorator';

import { QueryFilter } from 'src/common/decorator/query-filter';
import { DeleteUserRoleDto } from './dto/delete-user-role.dto';
import { NewUserRoleDto } from './dto/new-user-role.dto';
import { UserFilterDto } from './dto/user.filter.dto';
import { RoleSection } from './entity/user-role.entity';
import { rolesFilterHandler } from './handler/roles-filter.handler';
import { User } from './user.entity';
import { ExistUser } from './user.gard';
import { UserService } from './user.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateOwnPasswordDto } from './dto/update-own-password.dto';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from 'src/jwt/jwt.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { Role } from 'src/auth/role.decorator';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  @Get('/')
  @Role(['MAIN', 'USER'])
  getUserByFilter(
    @QueryFilter(rolesFilterHandler) userfilterDto: UserFilterDto,
  ) {
    if (userfilterDto.roles.length) {
      return this.userService.getUserByFilterRole(userfilterDto);
    }
    return this.userService.getUsersByFilter(userfilterDto);
  }

  @Get('/profile/:userId')
  @UseGuards(ExistUser)
  getUserById(
    @AuthUser(false) user: User,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    const access = user?.roles.find(({ section }) =>
      [RoleSection.MAIN, RoleSection.USER].includes(section),
    );
    return this.userService.getUserById(userId, !!access);
  }

  @Get('/me')
  getUsersRole(@AuthUser() user: User) {
    return this.userService.getUserById(user.id, true);
  }
  @Post()
  async createUser(
    @AuthUser() author: User,
    @Body() createUserDto: CreateUserDto,
  ) {
    const existEmail = await this.authService.findByEmail(createUserDto.email);
    if (existEmail) {
      throw new BadRequestException('ایمیل موجود میباشد');
    }
    const { password, user } = await this.userService.createUser(createUserDto);
    const payload = {
      userId: user.id,
      junk: user.password.slice(5, 10),
    };
    const resetToken = this.jwtService.sign(payload);
    await this.mailService.createNewAccount(user, password, resetToken);

    return {
      ok: true,
      userId: user.id,
    };
  }
  @Post('role/:userId')
  @UseGuards(ExistUser)
  @Role(['MAIN'])
  async addUserRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @AuthUser() author: User,
    @Body() newUserRoleDto: NewUserRoleDto,
  ) {
    try {
      const newUserRole = await this.userService.addUserRole(
        userId,
        author,
        newUserRoleDto,
      );
      return {
        newUserRole,
      };
    } catch (err) {
      throw err;
    }
  }
  @Put()
  async updateOwnProfile(
    @AuthUser() user: User,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const res = await this.userService.updateProfile(
      user.id,
      updateUserProfileDto,
    );
    if (res.emailUpdated) {
      const activeToken = this.jwtService.sign({
        code: res.updatedUser.verificationCode,
      });
      await this.mailService.sendCreateAccountConfimation(user, activeToken);
    }
    return res;
  }

  @Delete('role/:userId')
  @UseGuards(ExistUser)
  deleteUserRole(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() deleteUserRoleDto: DeleteUserRoleDto,
  ) {
    if (deleteUserRoleDto.all) {
      return this.userService.deleteUserRoles(userId);
    } else if (deleteUserRoleDto.sections?.length) {
      return this.userService.deleteUserRoles(
        userId,
        deleteUserRoleDto.sections,
      );
    }

    return new BadRequestException('باید یکی از فیلد های بخش یا همه را پرکنید');
  }

  @Put('reset-password')
  async updateOwnPassword(
    @AuthUser() user: User,
    @Body() updateOwnPasswordDto: UpdateOwnPasswordDto,
  ) {
    return this.userService.updateOwnPassword(
      user.id,
      updateOwnPasswordDto.currentPassword,
      updateOwnPasswordDto.newPassword,
    );
  }
}
