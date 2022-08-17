import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import { JwtService } from 'src/jwt/jwt.service';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { ForgetPasswrdOutputDTO } from './dto/forget-password.dto';
import { LoginDTO, LoginOutputDTO } from './dto/login.dto';
import { RegisterAuthDTO, RegisterOutputDTO } from './dto/register.dto';
import {
  ResetPassowrdDTO,
  ResetPasswordOutputDTO,
} from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly helplerService: HelperService,
    private readonly jwtService: JwtService,
  ) {}
  @Post('register')
  async register(
    @Body() registerDto: RegisterAuthDTO,
  ): Promise<RegisterOutputDTO> {
    const collection = this.helplerService.messageCollectionGen();
    const emailUsed = !!(await this.authService.findByEmail(registerDto.email));
    const usernameUsed = !!(await this.authService.findByUsername(
      registerDto.username,
    ));

    collection.setFlagMessage(emailUsed, 'email already used');
    collection.setFlagMessage(usernameUsed, 'username already used');

    if (collection.messages.length) {
      return new RegisterOutputDTO(collection.messages);
    }

    const user = await this.authService.createAccount(registerDto);

    return new RegisterOutputDTO(user.id);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDTO): Promise<LoginOutputDTO> {
    const user = await this.authService.loginAccount(loginDto);
    const payload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);

    return new LoginOutputDTO(accessToken);
  }

  @Get('forget-passowrd/:username')
  async forgetPassowrd(@Param('username') username: string) {
    let user = await this.authService.findByUsername(username);
    user = user ?? (await this.authService.findByEmail(username));

    let resetToken;

    if (user) {
      const payload = {
        userId: user.id,
        junk: user.password.slice(5, 10),
      };
      resetToken = this.jwtService.sign(payload);
      //send email
    }

    return new ForgetPasswrdOutputDTO(
      true,
      [`email send to user by username ${username}`],
      resetToken,
    );
  }

  @Get('reset-password/:resetToken')
  //Token is Valid
  async resetPassowrd(
    @Param('resetToken') resetToken: string,
    @Body() resetPasswordDto: ResetPassowrdDTO,
  ) {
    const decoded: any = this.jwtService.verify(resetToken);
    const user = await this.authService.getUserAuthById(decoded['userId']);
    const junk = user.password.slice(5, 10);

    if (junk !== decoded['junk']) {
      throw new BadRequestException('token is invalid for reset password');
    }
    const ok = await this.authService.resetUserPassword(
      user.id,
      resetPasswordDto.password,
    );

    const collection = this.helplerService.messageCollectionGen();

    collection.setMessage(
      ok ? 'رمز عبور با موفقیت تغییر یافت' : 'رمز عبور تغییر نکرد',
    );

    return new ResetPasswordOutputDTO(ok, collection.messages);
  }
}
